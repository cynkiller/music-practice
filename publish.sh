#!/bin/bash

npm run build:weapp 2>&1
git add .
git commit -m "$1"
git push origin mini-program -f