#!/bin/sh -e
rm slides/slides.zip
zip -r slides.zip slides/ &&
chmod 0666 slides.zip &&
mv slides.zip slides/
