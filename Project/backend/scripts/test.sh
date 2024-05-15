#!/bin/bash -e
cd codebase/
coverage run -m pytest -v
coverage report
exit 0
