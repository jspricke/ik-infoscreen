// id: #ID value without #
const refreshById = function(id) {
    return function () {
        $('#' + id).load(document.URL +  ' #' + id);
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
        refreshById('shoutbox');
    });

    XHR.addEventListener("error", function(event) {
        console.log('error');
    });

    XHR.open("POST", "./shoutbox.php");

    XHR.send(new FormData(document.getElementById('shoutboxform')));
}
