#!/bin/bash

mkdir -p _includes/
for file in README CONTRIBUTING; do
  git show master:${file}.md > _includes/${file}.md
done
bundle
bundle exec compass compile
bundle exec jekyll build
