#!/bin/sh -e
wget -rk http://www.interdisciplinary-college.de/ || true
(cd www.interdisciplinary-college.de
rename 's/index.html\?controller=collections&action=see_detail&id=(\d*)/detail$1.html/' *
sed -i -e '1,/col-lg-5">/ c <html><body>' -e '/!-- <div class="col-lg-4">/,$ c </body></html>' detail*
)
rm -r details
mkdir details
mv www.interdisciplinary-college.de/detail*.html details/
rm -r www.interdisciplinary-college.de
