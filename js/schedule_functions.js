// Note, the following variables are expected to exist:
// courses - list of courses in the conference (refer to schedula_data.js
//           for more details.
// start_date - start date of the conference in the format "YYYY-MM-DD"
// end_date - end date of the conference in the format "YYYY-MM-DD"

/**
 * This function returns an integer that indicates the
 * chronological order of the given time slot string.
 *
 * In more detail, "morning" is assigned to int 0,
 * "noon" to int 1, and so on.
 *
 * @param {string}    slot_string   a string indicating a time slot,
 *                                  e.g. "noon"
 * @return {int}                    an order index, e.g. 0.
 */
function slot_order(slot_string) {
	if(slot_string == 'morning') {
		return 0;
	} else if(slot_string == 'noon') {
		return 1;
	} else if(slot_string == 'afternoon') {
		return 2;
	} else if(slot_string == 'late-afternoon') {
		return 3;
	} else {
		return 4;
	}
}

/**
 * This function compares to session objects, x and y, chronologically.
 *
 * In more detail, the function returns -1 if x is earlier than y,
 * 0 if both are at the same time, and +1 if x is later than y.
 * For comparison, the method assums that both x and y have a
 * "date" property containing a date string of the format YYYY-MM-DD,
 * that both x and y have a "slot" property containing a time slot
 * string (either "morning", "noon", "afternoon", "late-afternoon", or
 * "evening"), and may additionally contain a "start_time" property
 * containing a time string in the format HH:MM.
 *
 * @param {Object}    x   a session object with the properties described above.
 * @param {Object}    y   a session object with the properties described above.
 * @return {int}          either -1 (if x < y), 0 (if x = y), or 1 (if x > y).
 *
 * @throws throws an error if x or y are malformed.
 */
function session_compare(x, y) {
	// first order lexicographically according to date string
	if(x.date < y.date) {
		return -1;
	} else if(x.date > y.date) {
		return 1;
	}
	// date strings are equal.
	// second, order according to timeslot
	var x_so = slot_order(x.slot);
	var y_so = slot_order(y.slot);
	if(x_so < y_so) {
		return -1;
	} else if(x_so > y_so) {
		return 1;
	}
	// time slots are equal
	// finally, sort according to start time
	if(x.start_time && y.start_time) {
		// order lexicographically according to start time string
		if(x.start_time < y.start_time) {
			return -1;
		} else if(x.start_time > y.start_time) {
			return 1;
		}
	}
	// both time sessions happen at the exact same time
	return 0;
}

/**
 * This function sorts for each course the sessions in chronologically ascending
 * order, as specified by the session_compare function above.
 *
 * @throws throws an error if any session object is malformed or a course has
 *         no defined sessions.
 */
function sort_all_sessions() {
	// iterate over all courses
	for(var c = 0; c < courses.length; c++) {
		var course = courses[c];
		// sort the sessions in this course using the
		// compare function above
		course.sessions.sort(session_compare);
	}
}

/**
 * This function tries to load session scheduling data from ical data
 * at the specified url.
 *
 * Please note: this function works asynchronously and may introduce delay due
 * to data being loaded from .ics files.
 *
 * @throws throws an error if any course has neither a sessions nor a
 *         sessions_url attribute, or if any of the HTTP GET requests fail,
           or if the .ics data in one file is malformed.
 */
async function load_all_sessions_from_ical(url) {
	// use the default url if none is given
	if(typeof url === 'undefined' || url === null) {
		url = 'https://interdisciplinary-college.org/schedule/calendar_data.php';
	}
	// ensure that all courses have a sessions attribute
	for(var c = 0; c < courses.length; c++) {
		var course = courses[c];
		if(!('sessions' in course)) {
			course.sessions = [];
		}
	}
	var received_calendar_data = false;
	// next, read the ical data from the url
	var sessions = [];
	try {
		sessions = await read_ical_from_url(url);
		// store the data in local storage
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("calendar_sessions", JSON.stringify(sessions));
		}
		received_calendar_data = true;
	} catch(e) {
		// if that does not work, log the exception and otherwise proceed
		console.log("reading global calendar data from " + url + " failed; could be a missing internet connection");
		// try to read the data from local storage instead
		if (typeof(Storage) !== "undefined") {
			sessions = localStorage.getItem("calendar_sessions");
			if (sessions !== null) {
				try {
					sessions = JSON.parse(sessions);
					console.log("Falling back to local storage of calendar data");
					received_calendar_data = true;
				} catch(e) {
					console.log("local storage contained invalid data: " + e);
					sessions = [];
				}
			} else {
				sessions = [];
			}
		}
	}
	// or fall back to static data, if that exists
	if(!received_calendar_data) {
		if(typeof calendar_data !== 'undefined' && calendar_data) {
			console.log("Falling back to offline calendar data.");
			sessions = read_ical_data(calendar_data);
		} else {
			alert("The system did not receive any calendar data and did not have offline backup data either; please check your internet connection.");
		}
	}
	if(sessions.length > 0) {
		// build a dictionary of course identifiers to courses for easier
		// access
		var course_dict = {};
		for(var c = 0; c < courses.length; c++) {
			var course = courses[c];
			course_dict[course.identifier] = course;
		}
		// sort the sessions into the correct courses by means of the
		// course_id attribute
		for(var s = 0; s < sessions.length; s++) {
			var session = sessions[s];
			// don't use the current session if it belongs to no course
			// or if this course is not listed
			if(!('course_id' in session) || !(session.course_id in course_dict)) {
				continue;
			}
			// otherwise, append it to the course
			var course = course_dict[session.course_id];
			course.sessions.push(session);
		}
	}
	// log warnings for courses that have no sessions
	for(var c = 0; c < courses.length; c++) {
		if(courses[c].sessions.length == 0) {
			console.warn('Course ' + courses[c].identifier + ' has no sessions.');
		}
	}
}

const DATEREGEX = /.*\:(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/;
const COURSE_ID_REGEX = /SUMMARY:(\w+\d+).*/;

/**
 * This function parses the given url as .ics data and returns the
 * parsing result as a Promise object.
 *
 * In more detail, the function assumes that the data in the given URL
 * is .ics data with a list of events and translates each event into a
 * session object with the properties 'slot' (either "morning", "noon",
 * "afternoon", "late-afternoon", or "evening"), 'location' if given, and
 * 'start_time' as well as 'end_time' if the slot is "evening".
 *
 * Please note: The result of this function is a Promise and is _not_ directly
 * available. If you wish for the parse to resolve, use an 'await' construct.
 *
 * @throws throws an error if the XMLHttpRequest fails (e.g. because the URL is
 *         malformed or because you try to access an external URL), or if the
 *         .ics data is malformed.
 */
function read_ical_from_url(url) {
	// only accept URLs ending with '.ics' or '.php'
	if(!url.endsWith(".ics") && !url.endsWith(".php")) {
		throw new Error("Currently, only ical/.ics and php files are supported.");
	}
	// set up a promise object which represent the parsed list of
	// sessions.
	return new Promise(function (resolve, reject) {
		// set up an XMLHttpRequest object which represents our
		// http connection to the .ics file.
		var xhttp = new XMLHttpRequest();
		// enforce plain text mimetype except if the url ends on .ics
		if(url.endsWith(".ics")) {
			xhttp.overrideMimeType("text/plain");
		}
		xhttp.addEventListener("error", function(evnt) {
			// if an error occurs, reject the promise and return the event
			reject(evnt);
		});
		// if the ready state changes, we check whether our data
		// has arrived with an anonymous function
		xhttp.onreadystatechange = function() {
			// if the readyState is 4 and the status is 200,
			// our data has arrived.
			if(this.readyState != 4 || this.status < 200) {
				return;
			}
			if(this.status != 200) {
				// if the status is _not_ 200 after the ready state changed
				// to 4, our request failed and we communicate that in the
				// promise API
				reject(this.status);
			}
			// parse the .ics data
			var sessions = read_ical_data(this.responseText);
			// if parsing has finished successfully, resolve the promise
			// and return the sessions we found.
			resolve(sessions);
		}; // the function for the xhttp request ends here
		// after setting up the xhttp request, open a connection for
		// a GET request
		xhttp.open("GET", url, true);
		// and send the request
		xhttp.send();
	}); // the definition of the Promise Object ends here
}

/**
 * This function parses the given plain text ical data and returns a
 * list of sessions with references to their curses.
 *
 * In more detail, the function assumes that the data
 * is .ics data with a list of events and translates each event into a
 * session object with the properties 'slot' (either "morning", "noon",
 * "afternoon", "late-afternoon", or "evening"), 'location' if given, and
 * 'start_time' as well as 'end_time' if the slot is "evening".
 *
 * @throws throws an error if the .ics data is malformed.
 */
function read_ical_data(data) {
	// get all lines of the .ics data
	var ical_lines = data.replace(/\r/g, '').split("\n");
	// set up an empty sessions list, to which we will push
	// our results
	var sessions = [];
	// during parsing, we keep track whether we're
	// currently in an event or not
	var in_event = false;
	// and we have a buffer object which accumulates all
	// the information for the session we're currently in.
	var current_session = {};
	// a temporary variable for the current line of the
	// .ics data
	var ical_line = '';
	// iterate over all lines
	for(var l = 0; l < ical_lines.length; l++) {
		ical_line = ical_lines[l];
		if(!in_event) {
			// if we are not inside an event yet, look for
			// starting lines for an event and ignore
			// everything else
			if(ical_line.startsWith('BEGIN:VEVENT')) {
				// begin a new session if we encounter a
				// BEGIN:VEVENT line
				in_event = true;
				current_session = {};
			}
		} else {
			// if we are inside an event, look for an end of the
			// event ...
			if(ical_line.startsWith('END:VEVENT')) {
				// end the current session if we encounter a
				// END:VEVENT line
				in_event = false;
				// check if the session contains at least a time
				// slot
				if(!current_session.slot) {
					throw new Error("Malformed .ical file. At least one event did not have a start time.");
				}
				sessions.push(current_session);
			} else if(ical_line.startsWith("DTSTART")) {
			// ... and for the start time of the event ...
				var found = ical_lines[l].match(DATEREGEX);
				// the first, second, and third group of the regex mark
				// year, month, and day respectively
				current_session.date = found[1] + '-' + found[2] + '-' + found[3];
				// the fourth group is the hour, the fifth the minute
				if(found[4] == "09") {
					current_session.slot = "morning";
				} else if(found[4] == "11") {
					current_session.slot = "noon";
				} else if(found[4] == "14") {
					current_session.slot = "afternoon";
				} else if(found[4] == "16") {
					current_session.slot = "late-afternoon";
				} else {
					current_session.slot = "evening";
					current_session.start_time = found[4] + ':' + found[5];
				}
			} else if(ical_line.startsWith("DTEND") && current_session.slot == "evening") {
			// ... and for the end time of the event ...
				var found = ical_lines[l].match(DATEREGEX);
				current_session.end_time = found[4] + ':' + found[5];
			} else if(ical_line.startsWith("SUMMARY")) {
			// ... and for the summary attribute, in which we expect a
			//     course identifier ...
				var found = ical_lines[l].match(COURSE_ID_REGEX);
				if(found) {
					current_session.course_id = found[1];
				}
			} else if(ical_line.startsWith("LOCATION")) {
			// ... as well as for its location.
				current_session.location = ical_line.substring("LOCATION:".length, ical_line.length);
			}
		}
	}
	// if we are still inside an event after parsing has finished,
	// something is wrong.
	if(in_event) {
		throw new Error("Malformed .ical file. At least one event was not properly closed.");
	}
	// if parsing has finished successfully, return the sessions we found.
	return sessions;
}
