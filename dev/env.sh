#!/bin/bash
PROJECT_ROOT_DIR=$(dirname "$(dirname "$(realpath "$0")")")
echo "PROJECT_ROOT_DIR=$PROJECT_ROOT_DIR"
eval "$(cat "$PROJECT_ROOT_DIR/.env" | sed 's/^/export /')"