#!/bin/sh -e

FILENAME=slides/all_slides.zip

zip -r slides.zip slides/ \
    -x "slides/*.zip" \
       "slides/zip/*" \
       "slides/MISSING_SLIDES"
chmod 0666 slides.zip
mv slides.zip $FILENAME

# prepare individual zips
cd slides
mkdir -p zip
rm -f zip/*
ls | while read course; do
	if [ -d "$course" ] || [ "$course" = "zip" ]; then # todo: the latter action fails
		zip -r "zip/$course.zip" "$course"
	fi
done
