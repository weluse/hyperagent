#!/bin/bash

set -e

LATEST_TAG=$(git describe --always --tags master)

mkdir -p _includes/
for file in README CONTRIBUTING INSTALL; do
  git show master:${file}.md > _includes/${file}.md
done

for dir in dist sample; do
  rm -r $dir
  git checkout master -- $dir
done

sed -ei "s:<var id=\"hyperagent-version\">.*</var>var>:<var id=\"hyperagent-version\">$LATEST_TAG</var>var>:" _layouts/page.html

bundle
bundle exec compass compile --relative-assets --force
bundle exec jekyll build

cd sample; bower install; cd ..
