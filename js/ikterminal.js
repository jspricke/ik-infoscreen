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

const sendShoutbox = function(evt) {
    if (evt.keyCode == 13) {
        document.getElementById('shoutboxform').submit();
    }
}

const submitShoutbox = function(evt) {
    evt.preventDefault();
    sendData();
    return false;
}

const sendData = function() {
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

const startTime = function() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	document.getElementById('time').innerHTML = padTime(h) + ":" + padTime(m);
	setTimeout(startTime, 1000);
}

const padTime = function(i) {
	if (i < 10) {
        i = "0" + i;
    }
	return i;
}

const startIKDay = function() {
    var now = new Date();
    var timeToPastMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0) - now;  // 5 Seconds for time differences
    setTimeout(function() {
        refreshById('ikday');
        startIKDay();
    }, timeToPastMidnight);
}

const scrollToActive = function() {
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

const loader = function() {
    startTime();
    startIKDay();
    refreshBySchedule('schedule', 60);
    refreshBySchedule('shoutbox_container', 5);
    refreshBySchedule('impressions', 20);
    document.getElementById('shoutboxmessage').addEventListener('onkeydown', sendShoutbox);
    document.getElementById('shoutboxform').addEventListener('submit', submitShoutbox);
    scrollToActive();
};
