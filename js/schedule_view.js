'use strict';

		// this function moves the day view one day forward
		function nextDay() {
			now.setDate(now.getDate() + 1);
			dayView(now);
		}

		// this function moves the day view one day back
		function prevDay() {
			now.setDate(now.getDate() - 1);
			dayView(now);
		}

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
	if(!courses || !sessions)
		return;
	merge_courses_sessions(sessions);
	sort_all_sessions();

	// remove all current session content from the view
	{
		var slots = ["morning", "noon", "afternoon", "late-afternoon", "evening"];
		for(var s = 0; s < slots.length; s++ ) {
			var slot_div = document.getElementById(slots[s] + "-slot");
			slot_div.className = null;
			for(var c = slot_div.children.length - 1; c > 0; c--) {
				slot_div.removeChild(slot_div.children[c]);
			}
		}
	}

	var template = document.querySelector('#lecture_template');
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
			if(session_date.getFullYear() != date.getFullYear() || session_date.getMonth() != date.getMonth() || session_date.getDate() != date.getDate()) {
				continue;
			}
			// check if the current session is 'active', i.e. if
			// it happens right now (or in the next 30 minutes)
			var today = new Date();
			if(today.getHours() < 6) {
			} else if (today.getHours() < 10 || (today.getHours() == 10 && today.getMinutes() <= 30)) {
				document.getElementById('morning-slot').className = 'timeslot_active';
			} else if (today.getHours() < 12 || (today.getHours() == 12 && today.getMinutes() <= 30)) {
				document.getElementById('noon-slot').className = 'timeslot_active';
			} else if (today.getHours() < 16) {
				document.getElementById('afternoon-slot').className = 'timeslot_active';
			} else if (today.getHours() < 18) {
				document.getElementById('late-afternoon-slot').className = 'timeslot_active';
			} else {
				document.getElementById('evening-slot').className = 'timeslot_active';
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
			var clone = template.content.cloneNode(true);
			clone.querySelector('.event').data_id = course.identifier;
			if(course.description)
				clone.querySelector('.event').title = course.description.replace(/<\/p><p>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '');

			var input = clone.querySelector('input');
			if (window.location.href.includes('hidetools')) {
			  input.style.display = 'none';
			} else {
			  input.value = c;
			  input.addEventListener('click', evt => {
				  evt.preventDefault();
				  toggleFavorite(evt.target.parentElement.parentElement.data_id);
				  updateFavorites();
			  });
			}

			clone.querySelector('.lecture_id').id = 'lecture_id_' + c;
			clone.querySelector('.location').id = 'lecture_id_' + c;
			clone.querySelector('.lecture_url').href = course.url;
			clone.querySelector('.lecture_id').textContent = course.identifier;

			if(course.sessions.length > 1) {
			  clone.querySelector('.lecturer').textContent = course.instructor + ' ' + (s+1) + '/' + courses[c].sessions.length;
			} else {
			  clone.querySelector('.lecturer').textContent = course.instructor;
			}

			if(session.start_time) {
				clone.querySelector('.location').textContent = session.location + " " + session.start_time + "-" + session.end_time;
			} else {
				clone.querySelector('.location').textContent = session.location;
			}
			clone.querySelector('.title').textContent = course.title;

			slot_div.appendChild(clone);

		}
	}
	// re-set the content of the current day label
	document.getElementById("today").textContent = date.toDateString();
	// disable the previous day button if the current day is the
	// first day of the conference
	if(date.getFullYear() == start_date.getFullYear() && date.getMonth() == start_date.getMonth() && date.getDate() == start_date.getDate()) {
		document.getElementById("prevDayButton").disabled = true;
	} else {
		document.getElementById("prevDayButton").disabled = false;
	}
	// disable the next day button if the current day is the last
	// day of the conference
	if(date.getFullYear() == end_date.getFullYear() && date.getMonth() == end_date.getMonth() && date.getDate() == end_date.getDate()) {
		document.getElementById("nextDayButton").disabled = true;
	} else {
		document.getElementById("nextDayButton").disabled = false;
	}
  updateFavorites();
}
