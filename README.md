# ik-infoscreen

This is the repository for the local infoscreen used at <a href="https://interdisciplinary-college.de">IK</a> in Günne.

On site, it is available on the local WiFi at <a href="http://guenne.ik">http://guenne.ik</a>.


## Development

To just run the infoscreen, get the php cli (`sudo apt install php-cli` or `brew install php71`).

Then just serve the directory:
~~~
php -S localhost:8080 & open localhost:8080
~~~

You can select different days using the preview buttons on top. To simulate a
specific date, it is possible to change the constants at the top of the
`index.php` file.


## Contributing

If you have suggestions, comments, problems, etc., send us your PRs, open
issues, or, in case of poor internet connectivity, talk to one of the
contributors in person.
