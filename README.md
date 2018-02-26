# ik-infoscreen

This is the repository for the local infoscreen used at <a href="https://interdisciplinary-college.de">IK</a> in Günne.

On site, it is available on the local WiFi at <a href="http://guenne.ik">http://guenne.ik</a>.

## Development

~~~
sudo apt install php-cli
sed -i 's/^\$TODAY.*$/$TODAY = \'2018-03-09\';/' index.php
php -S localhost:8080 & open localhost:8080
~~~

## Contributing

If you have suggestions, comments, problems, etc., send us your PRs, open
issues, or, in case of poor internet connectivity, talk to one of the
contributors in person.
