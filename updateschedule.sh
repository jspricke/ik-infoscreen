#!/bin/sh
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "request=see_all&start=2019-03-12&end=2019-03-19" "https://www.interdisciplinary-college.de/?controller=AJAX&action=get_calendar_events" -o "$(dirname "$0")/ikschedule.json"
