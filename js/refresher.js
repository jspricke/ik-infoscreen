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
        evt.preventDefault();
        console.log(this);
        this.form.submit();
    }
    return false;
}
