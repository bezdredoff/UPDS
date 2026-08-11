# Mobile ZIP inbox

This directory is used only on the dedicated `incoming` branch.
Upload one full-project ZIP here from the GitHub web UI on a phone.
The import workflow validates the archive, creates a `candidate/*` branch and PR,
and then resets the `incoming` branch so ZIP binaries do not accumulate in normal history.

Do not merge ZIP files from this directory into `main`.
