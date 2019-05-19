#!/bin/sh
rm -rf thumbs
mkdir thumbs
for i in images/*/*; do
	case "$(file -b "$i")" in
		*"image data"*)
			convert "$i" -resize 300 thumbs/"$(basename "$i")"
			;;
	esac
done
cp images/ik/guenne.svg thumbs/guenne.svg
chmod a+r thumbs/*
