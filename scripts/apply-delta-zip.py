#!/usr/bin/env python3
import json
import os
import shutil
import sys
import zipfile
from pathlib import Path, PurePosixPath

PROTECTED_PREFIXES = (
    ".github/workflows/",
    "scripts/validate-upload-zip.py",
    "scripts/apply-delta-zip.py",
)
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

def main() -> None:
    if len(sys.argv) != 4:
        print("usage: apply-delta-zip.py PATCH.zip BASE_SHA TARGET_DIR", file=sys.stderr)
        raise SystemExit(2)

    archive = Path(sys.argv[1])
    actual_base = sys.argv[2].strip()
    target = Path(sys.argv[3]).resolve()
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

        if manifest.get("format") != "upds-delta-v1":
            fail("unsupported manifest format")
        base_sha = str(manifest.get("baseSha", "")).strip()
        if not base_sha:
            fail("baseSha is required")
        if base_sha != actual_base:
            fail(f"stale baseSha: patch={base_sha}, current={actual_base}")

        feature = str(manifest.get("feature", "")).strip()
        if not feature:
            fail("feature is required")

        files = manifest.get("files", [])
        deletes = manifest.get("delete", [])
        if not isinstance(files, list) or not isinstance(deletes, list):
            fail("files/delete must be arrays")

        expected = {"patch-manifest.json"}
        normalized_files = []
        for item in files:
            if not isinstance(item, str):
                fail("files entries must be strings")
            p = safe_path(item)
            path = p.as_posix()
            if protected(path):
                fail(f"protected path cannot be modified by delta: {path}")
            normalized_files.append(path)
            expected.add(f"files/{path}")

        normalized_deletes = []
        for item in deletes:
            if not isinstance(item, str):
                fail("delete entries must be strings")
            p = safe_path(item)
            path = p.as_posix()
            if protected(path):
                fail(f"protected path cannot be deleted by delta: {path}")
            normalized_deletes.append(path)

        unexpected = names - expected
        missing = expected - names
        if unexpected:
            fail(f"unexpected archive entries: {sorted(unexpected)[:8]}")
        if missing:
            fail(f"missing declared archive entries: {sorted(missing)[:8]}")

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
            f"DELTA apply PASS: feature={feature}, files={len(normalized_files)}, "
            f"deletes={len(normalized_deletes)}, base={base_sha}"
        )

if __name__ == "__main__":
    main()
