const resetStatusMessage = function() {
    statusMessage = document.getElementById('statusMessage')
    statusMessage.classList.remove('error');
    statusMessage.classList.remove('warning');
    statusMessage.classList.remove('info');
}

const setStatusMessage = function(clazz, message) {
    statusMessage = document.getElementById('statusMessage')
    statusMessage.classList.add(clazz);
    statusMessage.innerHTML = message;
}

const submitFiles = function(event) {
    event.preventDefault();
    resetStatusMessage();
    var XHR = new XMLHttpRequest();

    XHR.addEventListener('load', function(event) {
        switch (event.target.status) {
            case 401:
                setStatusMessage('warning', 'Wrong password.');
                break;
            case 409:
                setStatusMessage('warning', 'Sorry, file exists already. Please choose a different name or talk to an admin.');
                break;
            case 413:
                setStatusMessage('error', 'File too large! Please split it or talk to the admins.');
                break;
            case 422:
                setStatusMessage('error', 'No file selected.');
                break;
            case 200: case 201: case 204:
                setStatusMessage('info', 'Upload successful. Thank you!');
                document.getElementById('fileUpload').reset();
                break;
            default:
                setStatusMessage('error', 'Unknown error. Please talk to the admins!');
        }
        setTimeout(function () {
            document.getElementById('uploadProgress').value = 0;
        }, 700);
    });

    XHR.upload.onprogress = function(event) {
        document.getElementById('uploadProgress').value = event.loaded / event.total * 100;
    };

    XHR.addEventListener('error', function(event) {
        console.error(event);
    });

    XHR.open('POST', '/incoming/incoming.php');

    XHR.send(new FormData(document.getElementById('fileUpload')));

    return false;
};

const initUploader = function() {
    document.getElementById('fileUpload').addEventListener('submit', submitFiles);
};
