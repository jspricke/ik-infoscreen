<?php
if(isset($_POST['msg']) && !empty($_POST['msg']))
{
  $string = time() . ' ' . $_SERVER['REMOTE_ADDR'] . ' ' . htmlspecialchars($_POST['msg']) . PHP_EOL;
  file_put_contents('CHAT', $string, FILE_APPEND | LOCK_EX);
}

$chat = file_get_contents('CHAT');
$chat = explode(PHP_EOL, $chat);
$chat = array_reverse($chat);
$chat = preg_replace("~[[:alpha:]]+://[^<>[:space:]]+[[:alnum:]/]~",
        "<a href=\"\\0\">\\0</a>", $chat);
$chat = preg_replace("~(?<=^|\s)#\w+\b~",
        "<font color=\"green\">\\0</font>", $chat);
$chat = preg_replace("~(?<=^|\s)@ ?(\d+\. )?\d+:\d+\b~",
        "<font color=\"red\">\\0</font>", $chat);
array_shift($chat);

$out = array_map(function($line) { [$time, $ip, $msg] = explode(' ', $line, 3); return ['#' . substr(md5($ip), 0, 6), date('d. H:i', $time), trim($msg)];}, $chat);
echo json_encode($out), "\n";
?>
