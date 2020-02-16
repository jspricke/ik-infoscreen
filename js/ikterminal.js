'use strict';

/** *** Refreshes *** **/

const contentFromHTMLById = function(html, id) {
  var dom = document.createElement('html');
  dom.innerHTML = html;
  return dom.querySelector('#' + id).innerHTML;
}

// id: #ID value without #
const refreshById = function(id) {
  return function () {
    var XHR = new XMLHttpRequest();

    XHR.addEventListener("load", function(event) {
      var content = contentFromHTMLById(XHR.responseText, id);
      document.getElementById(id).innerHTML = content;
    });

    XHR.addEventListener("error", function(event) {
      console.log(event);
    });

    XHR.open("GET", document.URL);
    XHR.send(null);
  };
}

// id: #ID value without #
// interval: time in seconds to reload
const refreshBySchedule = function(id, interval) {
  setInterval(refreshById(id), interval * 1000)
}


/** *** Shoutbox *** **/

const sendShoutbox = function(evt) {
  if (evt.keyCode == 13) {
    document.getElementById('shoutboxform').submit();
  }
}

const submitShoutbox = function(evt) {
  evt.preventDefault();
  sendShoutboxData();
  return false;
}

const sendShoutboxData = function() {
  var XHR = new XMLHttpRequest();

  XHR.addEventListener("load", function(event) {
    document.getElementById('shoutboxform').reset();
    refreshById('shoutbox_container')();
  });

  XHR.addEventListener("error", function(event) {
    console.log(event);
  });

  XHR.open("POST", "./shoutbox.php");

  XHR.send(new FormData(document.getElementById('shoutboxform')));
}


/** *** Date and Time *** **/

const startTime = function() {
  var today = new Date();
  var d = today.getDay();
  var h = today.getHours();
  var m = today.getMinutes();
  var w = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  document.getElementById('time').innerHTML = w[d] + ' ' + padTime(h) + ':' + padTime(m);
  setTimeout(startTime, 1000);
}

const padTime = function(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

const startIKDay = function() {
  var now = new Date();
  var timeToPastMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0) - now;  // 5 Seconds for time differences
  setTimeout(function() {
    refreshById('ikday')();
    startIKDay();
  }, timeToPastMidnight);
}


/** *** Scrolling *** **/

const scrollToActive = function() {
  // Don't scroll on large devices
  if (window.matchMedia('screen and (min-width: 1024px)')) {
    return;
  }

  var active = document.getElementById('timeslot_active');

  // If no timeslot is active, scroll to next timeslot
  if (!active) {
    var timeslots = document.getElementsByClassName('timeslot');
    var now = new Date();
    var now = padTime(now.getHours()) + ':' + padTime(now.getMinutes());
    for (var i = 0; i < timeslots.length; ++i) {
      var components = timeslots[i].children[0].innerHTML.split(' ');
      if (components.length > 1 && components[2] > now) {
        active = timeslots[i];
        break;
      }
    }
  }

  if (active) {
    window.scrollTo(0, active.offsetTop);
  }
}


/** *** Favorites *** **/

/**
 * Reads the course ids from the localStorage (course_ids) into a set.
 *
 * Returns:
 *   A set of course ids..
 */
const getFavorites = function() {
  var storage = window.localStorage;
  var ids = new Set();

  if ('course_ids' in storage) {
    JSON.parse(storage.getItem('course_ids')).forEach(e => ids.add(e));
  }

  return ids;
}

/**
 * Sets the course ids for the localStorage (course_ids).
 *
 * Args:
 *   ids A set containing the course ids.
 */
const setFavorites = function(ids) {
  window.localStorage.setItem('course_ids', JSON.stringify(Array.from(ids)));
}

/**
 * If an id is not present in the favorite list, add it.
 * Otherwise, remove it.
 *
 * Args:
 *   id The id to add or remove.
 */
const toggleFavorite = function(id) {
  var ids = getFavorites();
  if (ids.has(id)) {
    ids.delete(id);
  } else {
    ids.add(id);
  }
  setFavorites(ids);
}

/**
 * Swaps the visibility of (all) course items.
 * By default they are visible (courses_visible is not in localStorage), so the first call sets
 * this to false. Subsequent calls toggle between true and false.
 */
const toggleFavoriteVisibility = function() {
  var storage = window.localStorage;

  // null (default) -> false, true -> false, false -> true
  var visible = 'courses_visible' in storage ? storage.getItem('courses_visible') ^ true : false;
  storage.setItem('courses_visible', visible);

  applyFavoriteVisibility();
  scrollToActive();
}

/**
 * Changes the display style of all .event elements inside the #schedule.
 * If the localStorage's courses_visible is true (or null) all events are shown (display: block).
 * Otherwise, only the favorite events are shownn (all others get display: none).
 */
const applyFavoriteVisibility = function() {
  var ids = getFavorites();
  var visible = 'courses_visible' in window.localStorage ?
    window.localStorage.getItem('courses_visible') : true;

  var events = document.getElementById('schedule').getElementsByClassName('event');
  for (var i = 0; i < events.length; ++i) {
    var selected = ids.has(parseInt(events[i].getAttribute('data_id')))
    if (visible | selected) {
      events[i].style.display = 'block';
    } else {
      events[i].style.display = 'none';
    }
  }

  var toggler = document.getElementById('favtoggler');
  if (visible != 1) {
    toggler.classList.add('disabled');
  } else {
    toggler.classList.remove('disabled');
  }
}

/**
 * Cleans up the local storage.
 *
 * First, prompts the user to type "yes" to clear it to avoid accidental clearings.
 *
 * Removes the items course_ids and courses_visible. Applies the favorite
 * visibility, effectively showing all events.
 */
const clearFavorites = function() {
  var response = prompt('Type "yes" to clear the favorites.', 'no');
  if (response == 'yes') {
    window.localStorage.removeItem('course_ids');
    window.localStorage.removeItem('courses_visible');
    updateFavorites();
  }
}

/**
 * Updates the checkboxes. For selected events they are checked, for others not.
 */
const updateCheckboxes = function() {
  var ids = getFavorites();

  var events = document.getElementById('schedule').getElementsByClassName('event');
  for (var i = 0; i < events.length; ++i) {
    var selected = ids.has(parseInt(events[i].getAttribute('data_id')))
    var input = events[i].querySelector('input');
    input.checked = false;
    if (selected) {
      input.checked = true;
    }
  }
}

/**
 * Adds eventlisteners to all checkboxes inside the schedule.
 */
const addFavoriteEventListeners = function() {
  var ids = getFavorites();
  var inputs = document.getElementById('schedule').getElementsByTagName('input');
  for (var input of inputs) {
    input.addEventListener('click', evt => {
      evt.preventDefault();
      toggleFavorite(parseInt(evt.target.value));
      updateFavorites();
    });
  }
}

/**
 * Updates the checkboxes and the event visibilities.
 */
const updateFavorites = function() {
  applyFavoriteVisibility();
  // push back to the stack to avoid toggling issues with the checkbox states
  setTimeout(updateCheckboxes, 10);
}

/**
 * Copies the current list of favorites to the clipboard
 * and shows a short notification about the process.
 */
const exportFavorites = function() {
  var ids = getFavorites();
  prompt('Copy this and paste it on another device.', Array.from(ids).sort().join(','));
}

/**
 * Prompts the user to paste the list from the export.
 * Updates the favorites.
 */
const importFavorites = function() {
  var favorites = prompt('Insert your exported favorites. Leave blank to keep your current favorites.', '');
  if (favorites) {
    var ids = new Set(favorites.split(',').map(i => parseInt(i)));
    setFavorites(ids);
    updateFavorites();
  }
}


/** *** Entry point *** **/

const loader = function() {
  addFavoriteEventListeners();
  updateFavorites();

  // Refresh data
  startTime();
  startIKDay();
  refreshBySchedule('schedule', 60);
  refreshBySchedule('shoutbox_container', 5);
  if (window.matchMedia('screen and (min-width: 1024px)')) {
    refreshBySchedule('impressions', 20);
  }

  // Register event listeners
  new MutationObserver(() => {
    addFavoriteEventListeners();
    updateFavorites();
  }).observe(document.getElementById('schedule'), {childList: true} );
  document.getElementById('shoutboxmessage').addEventListener('onkeydown', sendShoutbox);
  document.getElementById('shoutboxform').addEventListener('submit', submitShoutbox);
  document.getElementById('favtoggler').addEventListener('click', toggleFavoriteVisibility);
  document.getElementById('export').addEventListener('click', exportFavorites);
  document.getElementById('import').addEventListener('click', importFavorites);
  document.getElementById('clear').addEventListener('click', clearFavorites);
  window.addEventListener('focus', evt => updateFavorites());

  scrollToActive();
};
