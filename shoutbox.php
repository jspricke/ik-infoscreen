<?php
if(isset($_POST['msg']) && !empty($_POST['msg']))
{
  $string = time() . ' ' . $_SERVER['REMOTE_ADDR'] . ' ' . htmlspecialchars($_POST['msg']) . PHP_EOL;
  file_put_contents('CHAT', $string, FILE_APPEND | LOCK_EX);
}
?>
