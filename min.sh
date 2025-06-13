#!/bin/bash

# Usage: ./minify-js.sh path/to/folder

DIR="$1"

if [ -z "$DIR" ]; then
  echo "Usage: $0 path/to/folder"
  exit 1
fi

if ! command -v minify &> /dev/null; then
  echo "Error: 'minify' is not installed. Run 'npm install -g minify'"
  exit 1
fi

find "$DIR" -type f -name "*.js" | while read -r file; do
  echo "Minifying $file"
  terser "$file" \
    --compress \
    --mangle \
    --ecma 2020 \
    --output "$file.tmp" \
    && mv "$file.tmp" "$file"
done

echo "✅ All .js files minified in $DIR"
