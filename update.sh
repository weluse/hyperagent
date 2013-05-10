#!/bin/bash

mkdir -p _includes/
for file in README CONTRIBUTING INSTALL; do
  git show master:${file}.md > _includes/${file}.md
done
bundle
bundle exec compass compile --relative-assets
bundle exec jekyll build
