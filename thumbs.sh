#!/bin/sh -e
rm thumbs/*
for i in images/*/*; do convert "$i" -resize 300 thumbs/"$(basename "$i")"; done
chmod a+r thumbs/*
cp images/ik/guenne.png thumbs/guenne.png
