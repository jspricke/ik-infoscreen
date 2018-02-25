// id: #ID value without #
const refreshById = function(id) {
    return function () {
        $('#' + id).load(document.URL +  ' #' + id + ">*");
    };
}

// id: #ID value without #
// interval: time in seconds to reload
const refreshBySchedule = function(id, interval) {
    setInterval(refreshById(id), interval * 1000)
}

const sendShoutbox = function ( evt ) {
    if (evt.keyCode == 13) {
        document.getElementById('shoutboxform').submit();
    }
}

const submitShoutbox = function ( evt ) {
    evt.preventDefault();
    sendData();
    return false;
}

const sendData = function () {
    var XHR = new XMLHttpRequest();

    XHR.addEventListener("load", function(event) {
        document.getElementById('shoutboxform').reset();
        refreshById('shoutbox_container', 'shoutbox_container');
    });

    XHR.addEventListener("error", function(event) {
        console.log('error');
    });

    XHR.open("POST", "./shoutbox.php");

    XHR.send(new FormData(document.getElementById('shoutboxform')));
}

function startTime() {
	    var today = new Date();
	    var h = today.getHours();
	    var m = today.getMinutes();
	    var s = today.getSeconds();
	    m = checkTime(m);
	    s = checkTime(s);
	    document.getElementById('time').innerHTML =
		    h + ":" + m;
		    //h + ":" + m + ":" + s;
	    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
	    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	    return i;
}

const loader = function() {
    startTime();
    refreshBySchedule('schedule', 60);
    refreshBySchedule('shoutbox_container', 5);
    refreshBySchedule('impressions', 20);
    document.getElementById('shoutboxmessage').addEventListener('onkeydown', sendShoutbox);
    document.getElementById('shoutboxform').addEventListener('submit', submitShoutbox);
    window.scrollTo(0, document.getElementById('timeslot_active').offsetTop);
};
