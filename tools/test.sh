#!/bin/sh
# Run the Holy Moly! tests. Arguments go to tests/run.py, for example:
#   tools/test.sh            everything (about 4 minutes)
#   tools/test.sh --quick    skip the slow passes (about 1.5 minutes)
#   tools/test.sh --only cards
set -e
cd "$(dirname "$0")/.."
exec python3 tests/run.py "$@"
