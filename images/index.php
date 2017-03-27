<?php

$showimg = false;
if (isset($_GET['folder']))
{
	$folder = $_GET['folder'];
	if (isset($_GET['imgidx']))
	{
		$imgidx = $_GET['imgidx'];		
	} else $imgidx = '0';

	if (!is_dir($folder))
	{
		unset($folder);
	}
	$showimg = true;
	
	$images = array();
	foreach (new DirectoryIterator('./'.$folder) as $fileInfo)
	{
		if ($fileInfo->isFile()) array_push($images, $fileInfo->getFilename());
	}
  sort($images);
}
function gen_link($folder, $imgidx, $t)
{
	$link = '<a href="./?';
	if (isset($folder)) $link .= 'folder='.$folder;
	if (isset($imgidx)) $link .= '&imgidx='.$imgidx;
	$link .= '">'.$t.'</a>'; 
  return $link;
}

?>

<html>
<head></head>
<body>

<?php if ($showimg) { ?>
<h1 style="text-align: center;">
	<?php if ($imgidx > 0) echo gen_link($folder,$imgidx-1,'Previous photo').' | '; ?>
	<a href="./?">All folders</a> |
	<?php
	echo $folder;
	if ($imgidx + 1 < count($images))
		echo ' | '.gen_link($folder,$imgidx + 1,'Next photo');
	?>
</h1>
<div>
<img src="<?php echo './'.$folder.'/'.$images[$imgidx]; ?>" width="1024"/>
</div>
<?php } else {
	foreach (new DirectoryIterator('.') as $fileInfo)
	{
		if ($fileInfo->isDot()) continue;
		if ($fileInfo->isDir())
			echo gen_link($fileInfo->getFilename(),null,$fileInfo->getFilename()) . "<br>\n";
	}
}

?>
</body>
</html>
