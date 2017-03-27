<?php
$password = "lecture";

if(isset($_POST['submit']) && isset($_POST['password'])){

if($_POST['password'] !== $password) {
	echo "<b>The password you entered is wrong. Please talk to an admin.</b>";
} else {

$upload_dir = "files/";
$upload_file = $upload_dir . basename($_FILES["file"]["name"]);

if (file_exists($upload_file)) {
	echo "<h1>Sorry, file already exists. Please choose a different name or talk to an admin.</h1>";
}
else {
	move_uploaded_file($_FILES["file"]["tmp_name"], $upload_file);

	echo "Upload of file <b>" . $_FILES["file"]["name"] . "</b> was successful. Thank you! An admin will make it accessible on conference server soon.";
}

}

}
?>
<html>
<head>
<title>Slides Upload</title>
</head>

<body>
<form method="post" action="index.php" enctype="multipart/form-data">
<h1>Slide Upload</h1>
Password: <input type="text" name="password" value="<?php if(isset($_POST['password'])){ echo $_POST['password']; } ?>"><br /><br />
Slide file <input type="file" name="file"><br /><br />
<input type="submit" name="submit" value="Upload">
</form>

Please upload multiple files separately.<br />

Please indicate the name/id of the lecture in the name of the uploaded files.<br />

If you have files bigger than 500MB, please hand them to us personally.
</body>

</html>
