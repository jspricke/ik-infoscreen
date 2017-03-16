// id: #ID value without #
const refreshById = function(id_inner, id_outer) {
    return function () {
        $('#' + id_outer).load(document.URL +  ' #' + id_inner);
    };
}

// id: #ID value without #
// interval: time in seconds to reload
const refreshBySchedule = function(id_inner, id_outer, interval) {
    setInterval(refreshById(id_inner, id_outer), interval * 1000)
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
