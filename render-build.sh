#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm ci

# Build the project
npm run build