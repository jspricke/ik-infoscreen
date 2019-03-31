#!/bin/sh
rm -rf thumbs
mkdir thumbs
for i in images/*/*; do
	[[ $i = *.mp4 ]] && continue
	[[ $i = *.MOV ]] && continue
	convert "$i" -resize 300 thumbs/"$(basename "$i")"
done
cp images/ik/guenne.svg thumbs/guenne.svg
chmod a+r thumbs/*
