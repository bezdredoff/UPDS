#!/usr/bin/env python3
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path, PurePosixPath

PROTECTED_PREFIXES = (
    ".github/workflows/",
    "scripts/validate-upload-zip.py",
    "scripts/apply-delta-zip.py",
)
SUPPORTED_FORMATS = {"upds-delta-v1", "upds-delta-v2"}
MAX_ENTRIES = 600
MAX_UNCOMPRESSED = 64 * 1024 * 1024


def fail(message: str) -> None:
    print(f"DELTA validation FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def safe_path(value: str) -> PurePosixPath:
    p = PurePosixPath(value)
    if not value or p.is_absolute() or ".." in p.parts or "." in p.parts:
        fail(f"unsafe path: {value!r}")
    if "\\" in value:
        fail(f"backslash path is not allowed: {value!r}")
    return p


def protected(path: str) -> bool:
    return any(path == prefix or path.startswith(prefix) for prefix in PROTECTED_PREFIXES)


def git(repo: Path, *args: str, allow_difference: bool = False) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode == 0:
        return result
    if allow_difference and result.returncode == 1:
        return result
    detail = result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}"
    fail(f"git {' '.join(args)} failed: {detail}")


def ensure_safe_rebase(
    source_repo: Path | None,
    patch_base: str,
    current_base: str,
    touched_paths: list[str],
) -> None:
    if patch_base == current_base:
        return
    if source_repo is None:
        fail("upds-delta-v2 stale base requires SOURCE_REPO for safe rebase validation")
    if not source_repo.is_dir():
        fail(f"SOURCE_REPO does not exist: {source_repo}")

    repo_head = git(source_repo, "rev-parse", "HEAD").stdout.strip()
    if repo_head != current_base:
        fail(f"SOURCE_REPO HEAD does not match current base: repo={repo_head}, current={current_base}")

    git(source_repo, "cat-file", "-e", f"{patch_base}^{{commit}}")
    ancestor = git(source_repo, "merge-base", "--is-ancestor", patch_base, current_base, allow_difference=True)
    if ancestor.returncode != 0:
        fail(f"baseSha is not an ancestor of current main: patch={patch_base}, current={current_base}")

    conflicts: list[str] = []
    for path in touched_paths:
        comparison = git(
            source_repo,
            "diff",
            "--quiet",
            patch_base,
            current_base,
            "--",
            path,
            allow_difference=True,
        )
        if comparison.returncode == 1:
            conflicts.append(path)

    if conflicts:
        preview = ", ".join(conflicts[:12])
        if len(conflicts) > 12:
            preview += f", ... (+{len(conflicts) - 12} more)"
        fail(f"safe rebase conflict: touched paths changed since baseSha: {preview}")

    print(
        f"DELTA safe rebase PASS: patch_base={patch_base}, current={current_base}, "
        f"touched_paths={len(touched_paths)}"
    )


def main() -> None:
    if len(sys.argv) not in (4, 5):
        print(
            "usage: apply-delta-zip.py PATCH.zip CURRENT_SHA TARGET_DIR [SOURCE_REPO]",
            file=sys.stderr,
        )
        raise SystemExit(2)

    archive = Path(sys.argv[1])
    actual_base = sys.argv[2].strip()
    target = Path(sys.argv[3]).resolve()
    source_repo = Path(sys.argv[4]).resolve() if len(sys.argv) == 5 else None
    if not archive.is_file():
        fail("patch archive does not exist")
    if not target.is_dir():
        fail("target directory does not exist")

    with zipfile.ZipFile(archive) as z:
        infos = z.infolist()
        if len(infos) > MAX_ENTRIES:
            fail(f"too many entries: {len(infos)}")
        total = sum(i.file_size for i in infos)
        if total > MAX_UNCOMPRESSED:
            fail(f"archive too large when extracted: {total} bytes")

        names = {i.filename for i in infos if not i.is_dir()}
        if "patch-manifest.json" not in names:
            fail("missing patch-manifest.json")

        try:
            manifest = json.loads(z.read("patch-manifest.json"))
        except Exception as exc:
            fail(f"invalid manifest JSON: {exc}")

        format_name = str(manifest.get("format", "")).strip()
        if format_name not in SUPPORTED_FORMATS:
            fail(f"unsupported manifest format: {format_name or '<missing>'}")
        base_sha = str(manifest.get("baseSha", "")).strip()
        if not base_sha:
            fail("baseSha is required")

        feature = str(manifest.get("feature", "")).strip()
        if not feature:
            fail("feature is required")

        files = manifest.get("files", [])
        deletes = manifest.get("delete", [])
        if not isinstance(files, list) or not isinstance(deletes, list):
            fail("files/delete must be arrays")

        expected = {"patch-manifest.json"}
        normalized_files: list[str] = []
        for item in files:
            if not isinstance(item, str):
                fail("files entries must be strings")
            p = safe_path(item)
            path = p.as_posix()
            if protected(path):
                fail(f"protected path cannot be modified by delta: {path}")
            normalized_files.append(path)
            expected.add(f"files/{path}")

        normalized_deletes: list[str] = []
        for item in deletes:
            if not isinstance(item, str):
                fail("delete entries must be strings")
            p = safe_path(item)
            path = p.as_posix()
            if protected(path):
                fail(f"protected path cannot be deleted by delta: {path}")
            normalized_deletes.append(path)

        if len(set(normalized_files)) != len(normalized_files):
            fail("duplicate files entry")
        if len(set(normalized_deletes)) != len(normalized_deletes):
            fail("duplicate delete entry")
        overlap = sorted(set(normalized_files).intersection(normalized_deletes))
        if overlap:
            fail(f"paths cannot be both replaced and deleted: {overlap[:8]}")

        unexpected = names - expected
        missing = expected - names
        if unexpected:
            fail(f"unexpected archive entries: {sorted(unexpected)[:8]}")
        if missing:
            fail(f"missing declared archive entries: {sorted(missing)[:8]}")

        if format_name == "upds-delta-v1":
            if base_sha != actual_base:
                fail(f"stale baseSha: patch={base_sha}, current={actual_base}")
        else:
            touched_paths = [*normalized_files, *normalized_deletes]
            ensure_safe_rebase(source_repo, base_sha, actual_base, touched_paths)

        # Apply replacements/creates.
        for path in normalized_files:
            dest = (target / path).resolve()
            if target not in dest.parents:
                fail(f"path escapes target: {path}")
            dest.parent.mkdir(parents=True, exist_ok=True)
            with z.open(f"files/{path}") as source, open(dest, "wb") as out:
                shutil.copyfileobj(source, out)

        # Apply deletions only after all archive validation passed.
        for path in normalized_deletes:
            dest = (target / path).resolve()
            if target not in dest.parents:
                fail(f"path escapes target: {path}")
            if dest.is_dir():
                fail(f"delete path is a directory: {path}")
            if dest.exists():
                dest.unlink()

        print(
            f"DELTA apply PASS: format={format_name}, feature={feature}, "
            f"files={len(normalized_files)}, deletes={len(normalized_deletes)}, "
            f"requested_base={base_sha}, applied_base={actual_base}"
        )


if __name__ == "__main__":
    main()
