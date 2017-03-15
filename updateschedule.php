<?php
    $url = 'https://www.interdisciplinary-college.de/index.php?controller=AJAX&action=get_calendar_events';
    $data = array(
        'request' => 'see_all',
        'start' => '2017-03-10',
        'end' => '2017-03-18'
    );
    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
        )
    );
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $return = file_put_contents('ikschedule.json', $result);
?><!DOCTYPE html>
<html>
<head>
    <title>Schedule Updater</title>
</head>
<body>
    <h1>Updated JSON</h1>
    <h2>Result: <?= $return ?></h2>
    <pre>
    <?php var_dump(json_decode($result)); ?>
    </pre>
</body>
</html>
