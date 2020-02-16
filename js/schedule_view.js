/*************
* Daily View *
*************/

/**
 * This function displays all scheduled events for a given day.
 *
 * This function assumes that the following DOM elements exist in the
 * tree.
 *
 * <div id="morning-slot">
 *   <h3>09:00-10:30</h3>
 * </div>
 * <div id="noon-slot">
 *   <h3>11:00-12:30</h3>
 * </div>
 * <div id="afternoon-slot">
 *   <h3>14:30-16:00</h3>
 * </div>
 * <div id="late-afternoon-slot">
 *   <h3>16:30-18:30</h3>
 * </div>
 * <div id="evening-slot">
 *   <h3>Evening</h3>
 * </div>
 *
 * It then attaches to the respective div tags new div tags, each of
 * which represents one course session that happens in this slot, i.e.
 * the course identifier (e.g. BC1, MC2, etc.), the location, the
 * course title, and the instructor.  All information
 * is integrated into spans with classes (refer to the code below for
 * details) to enable simple styling via CSS.
 * Which day is represented depends on the argument.
 *
 * @param {Date}    date     a javascript date object representing
 *                           the day for which the schedule should be
 *                           shown.
 *
 * @throws may throw errors if the courses data is malformed. Refer to
 *         shedule_data.js for details on the format.
 */
function dayView(date) {
	// remove all current session content from the view
	{
		var slots = ["morning", "noon", "afternoon", "late-afternoon", "evening"];
		for(var s = 0; s < slots.length; s++ ) {
			var slot_div = document.getElementById(slots[s] + "-slot");
			for(var c = slot_div.children.length - 1; c > 0; c--) {
				slot_div.removeChild(slot_div.children[c]);
			}
		}
	}

	// iterate over courses to find sessions for the
	// current day
	for(var c = 0; c < courses.length; c++) {
		var course = courses[c];
		// iterate over all sessions for the current
		// course
		for(var s = 0; s < course.sessions.length; s++) {
			var session = course.sessions[s];
			// check whether the session happens today.
			// If not, ignore it.
			var session_date = new Date(session.date);
			if(session_date.getYear() != date.getYear() || session_date.getMonth() != date.getMonth() || session_date.getDate() != date.getDate()) {
				continue;
			}
			// check if the current session is 'active', i.e. if
			// it happens right now (or in the next 30 minutes)
			var active;
			if(date.getHours() < 6) {
				active = false;
			} else if (date.getHours() < 10 || (date.getHours() == 10 && date.getMinutes() <= 30)) {
				active = session.slot == 'morning';
			} else if (date.getHours() < 12 || (date.getHours() == 12 && date.getMinutes() <= 30)) {
				active = session.slot == 'noon';
			} else if (date.getHours() < 16) {
				active = session.slot == 'afternoon';
			} else if (date.getHours() < 18) {
				active = session.slot == 'late-afternoon';
			} else {
				time_string = "" + date.getHours() + "-" + date.getMinutes();
				active = session.slot == 'evening' && time_string < session.end_time;
			}

			// if we reach this point, the session is
			// today. So let's display it in the schedule.
			// First, create the new DOM element to hold
			// our session view.
			// retrieve the matching parent div tag via the
			// slot of the session
			var slot_div = document.getElementById(session.slot + "-slot");
			if(!slot_div) {
				throw "Invalid slot: " + session.slot;
			}
			var session_div = new_child_with_class("div", "session" + (active ? " active" : ""), slot_div);
			// retrieve the course type and shorten it for css
			var course_type = shorten_course_type(course.type);
			// add the course id div tag to it
			var course_id_div = new_child_with_class("div", "course-id " + course_type, session_div);
			// add a span tag for the course identifier
			var course_id_span = new_child_with_class("span", "course-id", course_id_div);
			// generate a link tag to make the course identifier
			// clickable
			var course_id_a = new_link_child(course.url, course_id_span);
			// add the course identifier as text
			new_text_child(course.identifier, course_id_a);
			if(session.location) {
				// add a line break for the location
				new_br_child(course_id_div);
				// add a span tag for the course location
				var course_location_span = new_child_with_class("span", "location", course_id_div);
				// add the location number as text
				new_text_child(session.location, course_location_span);
			}
			// add the start and end time if we're considering a course in the
			// evening
			if(session.slot == "evening") {
				// add a line break for the start time
				new_br_child(course_id_div);
				// add a span tag for the start time
				var course_start_span = new_child_with_class("span", "start-time", course_id_div);
				// add the start time as text
				new_text_child(session.start_time, course_start_span);
				// add a line break for the end time
				new_br_child(course_id_div);
				// add a span tag for the end time
				var course_end_span = new_child_with_class("span", "end-time", course_id_div);
				// add the end time as text
				new_text_child(session.end_time, course_end_span);
			}
			// add the div tag for the course title
			var course_title_div = new_child_with_class("div", "course-title " + course_type, session_div);
			// add a span tag for the course title
			var course_title_span = new_child_with_class("span", "course-title", course_title_div);
			// add a link tag to make the course title clickable
			var course_title_a = new_link_child(course.url, course_title_span);
			// add the course title as text
			new_text_child(course.title, course_title_a);
			// add a line break for the instructor
			new_br_child(course_title_div);
			// add a span tag for the instructor
			var course_instructor_span = new_child_with_class("span", "instructor", course_title_div);
			// add a link tag to make the instructor clickable
			var course_instructor_a = new_link_child(course.url + "#lecturer", course_instructor_span);
			// add the instructor as text
			new_text_child(course.instructor, course_instructor_a);
			// if we have calendar data for this course, include a link
			if(course.sessions_url) {
				new_text_child(' ', course_title_div);
				var course_calendar_span = new_child_with_class("span", "calendar", course_title_div);
				var course_calendar_a = new_link_child(course.sessions_url, course_calendar_span);
				new_text_child('(.ics)', course_calendar_a);
			}
		}
	}
	// re-set the content of the current day label
	document.getElementById("today").textContent = date.toDateString();
	// disable the previous day button if the current day is the
	// first day of the conference
	var start = new Date(start_date);
	if(date.getYear() == start.getYear() && date.getMonth() == start.getMonth() && date.getDate() == start.getDate()) {
		document.getElementById("prevDayButton").disabled = true; 
	} else  {
		document.getElementById("prevDayButton").disabled = false; 
	}
	// disable the next day button if the current day is the last
	// day of the conference
	var end = new Date(end_date);
	if(date.getYear() == end.getYear() && date.getMonth() == end.getMonth() && date.getDate() == end.getDate()) {
		document.getElementById("nextDayButton").disabled = true; 
	} else  {
		document.getElementById("nextDayButton").disabled = false; 
	}
}

/**************
* Weekly View *
**************/

/**
 * This function displays the entire course schedule of the conference
 * in a table view.
 *
 * This function assumes that a skeleton of the table is already
 * available in the DOM tree, i.e. the following elements should
 * already exist:
 *
 * <table>
 *   <thead id="schedule-week-head">
 *   </thead>
 *   <tbody id="schedule-week-body">
 *   </tbody>
 * </table>
 *
 * It then attaches to the head two rows, first one for the days and
 * then another one for the time slots within these days. Note that
 * the first two columns are left empty.
 *
 * Afterwards, it attaches one row per course to the table body,
 * where the first column contains the course ID (e.g. 'BC1', 'MC2', etc.),
 * where the second column contains the course name and the instructor,
 * and where all subsequent colums are filled with the source location
 * if the course takes place in the respective time slot. All information
 * is integrated into spans with classes (refer to the code below for
 * details) to enable simple styling via CSS.
 *
 * @throws may throw errors if the courses data is malformed. Refer to
 *         shedule_data.js for details on the format.
 */
function weekView() {

	// as a preparation, generate a list of all time slots
	// in the conference, ordered according to days
	var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var conference_days = [];
	{
		var date_obj = new Date(start_date);
		var end_date_obj = new Date(end_date);
		// the first conference day starts at 14:30,
		// i.e. we have only three slots
		var first_day_obj = {
			"date" : get_date_string(date_obj),
			"day" : weekDays[date_obj.getDay()],
			"slots" : ["afternoon", "late-afternoon", "evening"]
		};
		conference_days.push(first_day_obj);
		// then, iterate over the intermediate days
		date_obj.setDate(date_obj.getDate() + 1);
		while(date_obj < end_date_obj) {
			var next_day_obj = {
				"date" : get_date_string(date_obj),
				"day" : weekDays[date_obj.getDay()],
				"slots" : ["morning", "noon", "afternoon", "late-afternoon", "evening"]
			};
			conference_days.push(next_day_obj);
			date_obj.setDate(date_obj.getDate() + 1);
		}
		// the last conference day ends at 12,
		// i.e. we only have one slot
		var last_day_obj = {
			"date" : get_date_string(date_obj),
			"day" : weekDays[date_obj.getDay()].substring(0, 3),
			"slots" : ["morning"]
		};
		conference_days.push(last_day_obj);
	}

	// write one column object for each timeslot to permit styling later
	var table = document.getElementById("schedule-week-table");
	new_child_with_class("col", "course-id", table);
	new_child_with_class("col", "course-title", table);
	for( var d = 0; d < conference_days.length; d++ ) {
		var day = conference_days[d];
		for ( var s = 0; s < day.slots.length; s++) {
			var slot = day.slots[s];
			new_child_with_class("col", slot, table);
		}
	}

	// as another preparation, disentangle evening courses,
	// regular courses, and rainbow courses in the overall
	// course list
	var regular_courses  = [];
	var rainbow_sessions = [];
	var evening_courses  = {};
	for ( var c = 0; c < courses.length; c++ ) {
		var course = courses[c];
		var course_type = shorten_course_type(course.type);

		if(course_type == "et") {
			evening_courses[course.sessions[0].date] = course;
		} else if(course_type == "rc") {
			for(var s = 0; s < course.sessions.length; s++) {
				var session_copy = Object.assign({}, course.sessions[s]);
				session_copy.identifier = course.identifier;
				session_copy.url = course.url;
				rainbow_sessions.push(session_copy);
			}
		} else if(course_type != "hk") {
			regular_courses.push(course);
		}
	}

	/************************************************
	* in a first step, generate the weekday headers *
	*************************************************/

	var header = document.getElementById("schedule-week-head");
	var day_row = new_child("tr", header);
	// first, an invisible filler entry
	var filler = new_child("td", day_row);
	filler.setAttribute("id", "filler");
	filler.setAttribute("rowspan", "2");
	filler.setAttribute("colspan", "2");
	// then, the actual day entries
	for( var d = 0; d < conference_days.length; d++ ) {
		var day_header_th = new_child_with_class("th", "day-header", day_row);
		day_header_th.setAttribute("colspan", conference_days[d].slots.length);
		new_text_child(conference_days[d].day, day_header_th);
	}

	/**************************************
	* next, generate the timeslot headers *
	***************************************/

	var timeslot_row = new_child("tr", header);
	for( var d = 0; d < conference_days.length; d++ ) {
		var day = conference_days[d];
		for ( var s = 0; s < day.slots.length; s++) {
			var slot = day.slots[s];
			if(slot != "evening") {
				// if the current slot is not an evening slot,
				// add it directly
				new_timeslot_header(slot, timeslot_row);
			} else {
				// otherwise, use the start and end time of
				// the respective evening course
				var evening_course = evening_courses[day.date];
				var start_time;
				var end_time;
				if(!evening_course) {
					start_time = "";
					end_time = "";
				} else {
					start_time = evening_course.sessions[0].start_time;
					end_time = evening_course.sessions[0].end_time;
				}
				new_evening_timeslot_header(start_time, end_time, timeslot_row);
			}
		}
	}

	/************************************
	* next, generate one row per course *
	*************************************/

	var tbody = document.getElementById("schedule-week-body");
	for ( var c = 0; c < regular_courses.length; c++ ) {
		var course = regular_courses[c];
		var course_type = shorten_course_type(course.type);
		// add the row
		var course_row = new_child("tr", tbody);
		// add the table cell containing the course id
		var course_id_td = new_child_with_class("td", "course-id " + course_type, course_row);
		// add a span tag for the course identifier
		var course_id_span = new_child_with_class("span", "course-id", course_id_td);
		// generate a link tag to make the course identifier
		// clickable
		var course_id_a = new_link_child(course.url, course_id_span);
		// add the course identifier as text
		new_text_child(course.identifier, course_id_a);
		// add the table cell for the course title
		var course_title_td = new_child_with_class("td", "course-title " + course_type, course_row);
		// add a span tag for the course title
		var course_title_span = new_child_with_class("span", "course-title", course_title_td);
		// add a link tag to make the course title clickable
		var course_title_a = new_link_child(course.url, course_title_span);
		// add the course title as text
		if(course.short_title) {
			new_text_child(course.short_title, course_title_a);
		} else {
			new_text_child(course.title, course_title_a);
		}
		// add a line break for the instructor
		new_br_child(course_title_td);
		// add a span tag for the instructor
		var course_instructor_span = new_child_with_class("span", "instructor", course_title_td);
		// add a link tag to make the instructor clickable
		var course_instructor_a = new_link_child(course.url + "#lecturer", course_instructor_span);
		// add the instructor as text
		new_text_child(course.instructor, course_instructor_a);
		// if we have calendar data for this course, include a link
		if(course.sessions_url) {
			new_text_child(' ', course_title_td);
			var course_calendar_span = new_child_with_class("span", "calendar", course_title_td);
			var course_calendar_a = new_link_child(course.sessions_url, course_calendar_span);
			new_text_child('(.ics)', course_calendar_a);
		}

		// now, iterate over all time slots, add a table cell for each,
		// and color the ones in which the current course takes place
		var se = 0;
		for( var d = 0; d < conference_days.length; d++ ) {
			var day = conference_days[d];
			for ( var s = 0; s < day.slots.length; s++) {
				var slot = day.slots[s];
				// check whether the current slot belongs
				// to the course
				if(se < course.sessions.length && course.sessions[se].date == day.date &&
					course.sessions[se].slot == slot && slot != "evening" ) {
					// add a table cell with a color according
					// to the course type
					var slot_td = new_child_with_class("td", "slot-box " + slot + "-slot " + course_type, course_row);
					if(course.sessions[se].location) {
						// add a span for the course location
						var course_location_span = new_child_with_class("span", "location", slot_td);
						// add the location as text
						new_text_child(course.sessions[se].location, course_location_span);
						// add a map of the respective room
						var lowercase_location = course.sessions[se].location.toLowerCase()
						if(lowercase_location.startsWith('h1') || lowercase_location.startsWith('h2') || lowercase_location.startsWith('h3') || lowercase_location.startsWith('h4') || lowercase_location.startsWith('f1') || lowercase_location.startsWith('f2')) {
							var map = new_child_with_class("img", "map", slot_td);
							map.setAttribute("src", "../../schedule/lecture_rooms_map_" + course.sessions[se].location.toLowerCase() + ".svg");
						}
					}
					// increment the session index
					se++;
				} else {
					// check if this is an evening slot.
					if(slot == "evening") {
						// If so, check if we currently add the
						// first course.
						if(c == 0) {
							// If so, we need to add the
							// evening talk for the current slot
							var evening_course = evening_courses[day.date];
							var slot_td = new_child_with_class("td", "slot-box rowspan evening-slot", course_row);
							// this slot should span the entire table (including an
							// extra row for the rainbow courses)
							slot_td.setAttribute("rowspan", regular_courses.length + 1);
							if(evening_course) {
								if(evening_course.identifier.toUpperCase().startsWith('ET')) {
									// add a span tag for the course identifier
									var course_id_span = new_child_with_class("span", "course-id", slot_td);
									// generate a link tag to make the course identifier
									// clickable
									var course_id_a = new_link_child(evening_course.url, course_id_span);
									// add the course identifier as text
									new_text_child(evening_course.identifier, course_id_a);
									// add a whitespace
									new_text_child(" ", slot_td);
								}
								// add a span tag for the instructor
								var course_instructor_span = new_child_with_class("span", "instructor", slot_td);
								// add a link tag to make the instructor clickable
								var course_instructor_a = new_link_child(evening_course.url + "#lecturer", course_instructor_span);
								// add the instructor as text
								if(evening_course.instructor != "") {
									new_text_child(evening_course.instructor, course_instructor_a);
									// add a colon
									new_text_child(": ", slot_td);
								}
								// add a span tag for the course title
								var course_title_span = new_child_with_class("span", "course-title", slot_td);
								// add a link tag to make the course title clickable
								var course_title_a = new_link_child(evening_course.url, course_title_span);
								// add the course title as text
								new_text_child(evening_course.title, course_title_a);
							}
						}
					} else {
						// if this is _not_ an evening slot, add an empty box
						var slot_td = new_child_with_class("td", "slot-box " + slot + "-slot ", course_row);
					}
				}
			}
		}
	}
	// add a last row for rainbow courses.
	var course_row = new_child("tr", tbody);
	// add the table cell containing the course id
	var course_id_td = new_child_with_class("td", "course-id rc", course_row);
	// add a span tag for the course identifier
	var course_id_span = new_child_with_class("span", "course-id", course_id_td);
	// add the course identifier as text
	new_text_child("RC", course_id_span);
	// add the table cell for the course title
	var course_title_td = new_child_with_class("td", "course-title rc", course_row);
	// add a span tag for the course title
	var course_title_span = new_child_with_class("span", "course-title", course_title_td);
	// add the course title as text
	new_text_child("Rainbow courses", course_title_span);

	// now, iterate over all time slots, add a table cell for each,
	// and color the ones in which the current course takes place
	var se = 0;
	for( var d = 0; d < conference_days.length; d++ ) {
		var day = conference_days[d];
		for ( var s = 0; s < day.slots.length; s++) {
			var slot = day.slots[s];
			// check whether the current slot belongs
			// to a rainbow course
			if(se < rainbow_sessions.length && rainbow_sessions[se].date == day.date &&
				rainbow_sessions[se].slot == slot) {
				// add a table cell with a color according
				// to the course type
				var slot_td = new_child_with_class("td", "slot-box " + slot + "-slot rc", course_row);
				// add a span tag for the course identifier
				var course_id_span = new_child_with_class("span", "course-id", slot_td);
				// generate a link tag to make the course identifier
				// clickable
				var course_id_a = new_link_child(rainbow_sessions[se].url, course_id_span);
				// add the course identifier as text
				new_text_child(rainbow_sessions[se].identifier, course_id_a);
				if(rainbow_sessions[se].location) {
					// add a line break for the location
					new_br_child(slot_td);
					// add a span for the course location
					var course_location_span = new_child_with_class("span", "location", slot_td);
					// add the location as text
					new_text_child(rainbow_sessions[se].location, course_location_span);
				}
				// increment the session index
				se++;
			} else if(slot != "evening") {
				var slot_td = new_child_with_class("td", "slot-box " + slot + "-slot ", course_row);
			}
		}
	}
}

/**
 * This function transforms a javascript date object into a date
 * string with the format YYYY-MM-DD.
 *
 * @param {Date}    date     a javascript date object.
 * @return {string}          a string with the format YYYY-MM-DD.
 */
function get_date_string(date) {
	var date_str = "" + date.getUTCFullYear();
	var month = date.getUTCMonth() + 1;
	if(month < 10) {
		date_str += "-0" + month;
	} else {
		date_str += "-" + month;
	}
	var day = date.getUTCDate();
	if(day < 10) {
		date_str += "-0" + day;
	} else {
		date_str += "-" + day;
	}
	return date_str;
}

/**
 * This function creates an evening timeslot header for the week view table.
 *
 * In more detail, this function returns the following DOM element:
 * <td class="timeslot-header evening-slot">$start_time<br/>$end_time</td>,
 * where $start_time and $end_time are the respective input arguments.
 * This element is attached to the row argument.
 *
 * @param {string}    start_time   a time string (e.g. "09:00").
 * @param {string}    end_time     a time string (e.g. "10:30").
 * @param {Object}    row          a DOM node to which the given td should
 *                                 be attached.
 * @return {Object}                a table data DOM element as shown above.
 */
function new_evening_timeslot_header(start_time, end_time, row) {
	var timeslot = new_child_with_class("td", "timeslot-header evening-slot", row);
	new_text_child(start_time, timeslot);
	new_br_child(timeslot);
	new_text_child(end_time, timeslot);
	return timeslot;
}

/**
 * This function creates a timeslot header for the week view table.
 *
 * In more detail, this function returns the following DOM element:
 * <td class="timeslot-header $slot-slot">$start_time<br/>$end_time</td>,
 * where $slot is the respective input argument and $start_time as well
 * as $end_time are the respective start and end time strings for the
 * given time slot, e.g. "09:00" and "10:30" for the "morning" slot.
 * This element is attached to the row argument.
 *
 * @param {string}    slot   a time slot string (either "morning", "noon",
 *                           "afternoon", or "late-afternoon"). Evening slots
 *                           are handled by the new_evening_timeslot_header
 *                           function.
 * @param {Object}    row    a DOM node to which the given td should
 *                           be attached.
 * @return {Object}          a table data DOM element as shown above.
 */
function new_timeslot_header(slot, row) {
	var timeslot = new_child_with_class("td", "timeslot-header " + slot + "-slot", row);
	// retrieve the start and end times for the given slot
	var start_time;
	var end_time;
	if(slot == "morning") {
		start_time = "09:00";
		end_time = "10:30";
	} else if(slot == "noon") {
		start_time = "11:00";
		end_time = "12:30";
	} else if(slot == "afternoon") {
		start_time = "14:30";
		end_time = "16:00";
	} else if(slot == "late-afternoon") {
		start_time = "16:30";
		end_time = "18:00";
	} else {
		throw "Illegal slot: " + slot;
	}
	new_text_child(start_time, timeslot);
	new_br_child(timeslot);
	new_text_child(end_time, timeslot);
	return timeslot;
}

/***************************
* Shared Utility Functions *
***************************/

/**
 * This function creates a new DOM element with the given tag and
 * attaches it to the given parent.
 *
 * In more detail, the new element will be:
 * <$tag></$tag>
 *
 * @param {string}    tag    a HTML tag.
 * @param {Object}    parent a parent DOM element.
 * @return {Object}          the newly created DOM element.
 */
function new_child(tag, parent) {
	var new_child = document.createElement(tag);
	parent.appendChild(new_child);
	return new_child;
}

/**
 * This function creates a new DOM element with the given tag
 * and the given class and attaches it to the given parent.
 *
 * In more detail, the new element will be:
 * <$tag class="$cls"></$tag>
 *
 * @param {string}    tag    a HTML tag.
 * @param {string}    cls    a class string.
 * @param {Object}    parent a parent DOM element.
 * @return {Object}          the newly created DOM element.
 */
function new_child_with_class(tag, cls, parent) {
	var new_child = document.createElement(tag);
	new_child.setAttribute("class", cls);
	parent.appendChild(new_child);
	return new_child;
}

/**
 * This function creates a new <br/> DOM element and attaches
 * it to the given parent.
 *
 * @param {Object}    parent a parent DOM element.
 * @return {Object}          the newly created DOM element.
 */
function new_br_child(parent) {
	var new_child = document.createElement("br");
	parent.appendChild(new_child);
	return new_child;
}

/**
 * This function creates a new <a href="$href"></a> DOM element
 * and attaches it to the given parent.
 *
 * @param {string}    href   the URL for the new link tag.
 * @param {Object}    parent a parent DOM element.
 * @return {Object}          the newly created DOM element.
 */
function new_link_child(href, parent) {
	var new_child = document.createElement("a");
	new_child.setAttribute("href", href);
	parent.appendChild(new_child);
	return new_child;
}

/**
 * This function creates a new text DOM element
 * and attaches it to the given parent.
 *
 * @param {string}    txt    the text to be attached.
 * @param {Object}    parent a parent DOM element.
 * @return {Object}          the newly created DOM element.
 */
function new_text_child(txt, parent) {
	var new_child = document.createTextNode(txt);
	parent.appendChild(new_child);
	return new_child;
}

/**
 * This function returns a short course type string
 * for the given long form.
 *
 * @param {string}    type_string   a long form type string,
                                    e.g. "Basic Course".
 * @return {string}                 a short form type string, e.g. "bc".
 *
 * @throws throws an error if the given long form is unknown.
 */
function shorten_course_type(type_string) {
	if(type_string === "Basic Course" || type_string === "Introductory Course") {
		return "bc";
	}
	if(type_string === "Method Course" || type_string === "Advanced Course") {
		return "mc";
	}
	if(type_string === "Special Course" || type_string === "Focus Course") {
		return "sc";
	}
	if(type_string === "Practical Course") {
		return "pc";
	}
	if(type_string === "Professional Course") {
		return "prc";
	}
	if(type_string === "Rainbow Course") {
		return "rc";
	}
	if(type_string === "Evening Talk") {
		return "et";
	}
	if(type_string === "Additional Event") {
		return "evnt";
	}
	if(type_string === "Hack") {
		return "hk";
	}
	throw new Error("Unknown course type: " + type_string);
}
