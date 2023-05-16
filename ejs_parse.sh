#!/bin/bash

current_directory="$PWD"

check_ejs_files() {
  local depth=$1
  local directory=$2

  if [[ $depth -gt 10 ]]; then
    return
  fi

  for file in "$directory"/*; do
    if [[ -d "$file" ]]; then
      check_ejs_files $((depth + 1)) "$file"
    elif [[ "$file" == *.ejs ]]; then
      prettier --write --parser html "$file"
      echo "file: $file parse"
    fi
  done
}

directory="$current_directory"

echo "$directory"
check_ejs_files 1 "$directory"
