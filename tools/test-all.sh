#!/bin/sh
# Everything that must pass before a commit: lesson validator, unit tests, browser smoke test.
set -e
cd "$(dirname "$0")/.."
node tools/validate-lessons.mjs | tail -1
node --test tests/*.test.mjs 2>&1 | grep -E '^# (pass|fail)'
node --test tests/*.test.mjs > /dev/null 2>&1
node tools/smoke.mjs "$@"
