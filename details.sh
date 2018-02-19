#!/bin/sh -e
mkdir -f details
cd details
rm -f ./*
for id in $(grep -oP '"coll_id":"\K[0-9]+' ../ikschedule.json | uniq); do
	curl "https://www.interdisciplinary-college.de/index.php?controller=collections&action=see_detail&id=$id" | \
	sed -e '1,/panel-heading">/ c <html><body>' -e '/!-- <div class="col-lg-4">/,$ c </body></html>' | \
	grep -Ev "</?div" > "detail$id.html"
	IMG="$(grep -oP '<img .* src="\K[^"]*' "detail$id.html")"
	curl -O "$IMG"
	sed -i -e "s#$IMG#$(basename "$IMG")#" "detail$id.html"
done
