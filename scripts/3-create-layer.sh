#!/bin/bash
set -eo pipefail
if [ ! -d ./nodejs/node_modules ]; then
  cd nodejs
  echo "Installing libraries..."
  npm install
  cd ..
fi

