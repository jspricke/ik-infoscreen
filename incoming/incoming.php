<?php
// Guessing the server stripped the payload if both POST and FILES are empty.
if (empty($_POST) && empty($_FILES)) {
    header("HTTP/1.1 413 Payload Too Large");
    exit;
}

$password = "lecture";

// Empty or wrong password
if (!isset($_POST['password']) || $_POST['password'] !== $password) {
    header("HTTP/1.1 401 Unauthorized");
    exit;
}

// No file selected for upload
if (empty($_FILES) || !isset($_FILES["file"]) || empty($_FILES["file"]["name"])) {
    header("HTTP/1.1 422 Unprocessable Entity");
    exit;
}

$upload_dir = "files/";
$upload_file = $upload_dir . basename($_FILES["file"]["name"]);

if (file_exists($upload_file)) {
    header("HTTP/1.1 409 Conflict");
    exit;
}

move_uploaded_file($_FILES["file"]["tmp_name"], $upload_file);
header("HTTP/1.1 201 Created");
?>
