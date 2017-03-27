#!/bin/sh -e
for i in images/*/*; do convert "$i" -resize 300 thumbs/"$(basename "$i")"; done
chmod a+r thumbs/*
