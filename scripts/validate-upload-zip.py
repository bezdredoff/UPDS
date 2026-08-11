#!/usr/bin/env python3
"""Validate a full-project ZIP before any candidate code is executed."""
from __future__ import annotations

import os
import stat
import sys
import zipfile
from pathlib import PurePosixPath

MAX_COMPRESSED_BYTES = 25 * 1024 * 1024
MAX_UNCOMPRESSED_BYTES = 250 * 1024 * 1024
MAX_FILES = 5000
FORBIDDEN_PARTS = {'.git', 'node_modules', 'dist', '.vite', 'coverage'}
REQUIRED_ROOT_FILES = {'package.json', 'package-lock.json', 'index.html', 'tsconfig.json', 'vite.config.ts'}


def fail(message: str) -> None:
    print(f'ZIP validation failed: {message}', file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if len(sys.argv) != 2:
        fail('usage: validate-upload-zip.py <archive.zip>')
    archive = sys.argv[1]
    if not os.path.isfile(archive):
        fail(f'archive not found: {archive}')
    if os.path.getsize(archive) > MAX_COMPRESSED_BYTES:
        fail('archive is larger than 25 MiB mobile-upload contract')

    with zipfile.ZipFile(archive) as zf:
        infos = zf.infolist()
        if not infos:
            fail('archive is empty')
        if len(infos) > MAX_FILES:
            fail(f'archive contains more than {MAX_FILES} entries')

        total = 0
        root_files: set[str] = set()
        for info in infos:
            raw = info.filename.replace('\\', '/')
            path = PurePosixPath(raw)
            if raw.startswith('/') or path.is_absolute():
                fail(f'absolute path is forbidden: {raw}')
            if not path.parts or any(part in ('', '.', '..') for part in path.parts):
                fail(f'unsafe path is forbidden: {raw}')
            if any(part in FORBIDDEN_PARTS for part in path.parts):
                fail(f'forbidden generated/VCS directory: {raw}')

            unix_mode = (info.external_attr >> 16) & 0xFFFF
            if unix_mode and stat.S_ISLNK(unix_mode):
                fail(f'symlink entry is forbidden: {raw}')

            total += info.file_size
            if total > MAX_UNCOMPRESSED_BYTES:
                fail('archive expands beyond 250 MiB safety limit')
            if len(path.parts) == 1 and not info.is_dir():
                root_files.add(path.name)

        missing = sorted(REQUIRED_ROOT_FILES - root_files)
        if missing:
            fail('required files must be at ZIP root: ' + ', '.join(missing))

    print(f'ZIP validation PASS: {len(infos)} entries, {total} uncompressed bytes')


if __name__ == '__main__':
    main()
