#!/bin/bash

mkdir -p _includes/
git show master:README.md > _includes/README.md
bundle
bundle exec compass compile
bundle exec jekyll build
