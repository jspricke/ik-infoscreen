#!/bin/sh -e
rm -rf thumbs
mkdir thumbs
for i in images/*/*; do convert "$i" -resize 300 thumbs/"$(basename "$i")"; done
chmod a+r thumbs/*
cp images/ik/guenne.svg thumbs/guenne.svg
