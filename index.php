<?php
$START = '2017-03-10';
$END = '2017-03-18';
$TIMES = array('09:00' => '10:30', '11:00' => '12:30', '14:30' => '16:00', '16:30' => '18:00', 'Evening' => 'End of Day');
date_default_timezone_set('Europe/Berlin');
$TODAY = date('Y-m-d');

// hack, since the json does not contain lecturers
$INSTRUCTORS = array(
    'ET4:' => 'Wachsmuth',
    'MC1' => 'Pascanu',
    'MC3' => 'Verleysen',
    'MC4' => 'Spranger',
    'PC1' => 'Smeddinck',
    'PC3' => 'Maier',
    'RC2' => 'Klug',
    'SC2' => 'Gervas',
    'SC5' => 'Steward',
    'SC6' => 'Gjorgjieva',
    'SC10' => 'Rovatsos',
    'SC11' => 'Baronchelli',
    'SC13' => 'Banisch',
    'SC14' => 'Kuhn',
    'SC15' => 'Steedman',
    'PC2' => 'van Trijp, van Eecke',
    'SC3' => 'Veale',
    'SC7' => 'Batista',
    'RC3' => 'Bechberger',
    'RC4' => 'Schick',
    'RC5' => 'Berov',
    'MC5' => 'Cardoso',
    'SC1' => 'London',
    'SC8' => '<del>Schreiber</del> Jaeger',
    'SC16' => 'Hanappe',
    'ET3' => 'Kuhn',
);

$start_date = new DateTime($START . ' 00:00'); $today_date = new DateTime($TODAY . ' 00:00');
$evening_date = new DateTime($TODAY . ' 18:00');
$current_day = $today_date->add(new DateInterval('P1D'))->diff($start_date)->format('%a');

function read_shouts() {
    $chat = file_get_contents('CHAT');
    $chat = explode(PHP_EOL, $chat);
    $chat = array_reverse($chat);
    unset($chat[0]);
    return $chat;
}

function read_schedule() {
    return json_decode(file_get_contents('ikschedule.json'))->events;
}

function filter_schedule($schedule, $day) {
    return array_filter($schedule, function ($element) use ($day) {
        $start_datetime = new DateTime($element->start);
            return $start_datetime->format('Y-m-d') == $day;
        });
}

function event_group_list_item($event, $start_time, $evening_time, $instructors) {
    $evt_start = new DateTime($event->start);
    $time = '';
    if ($start_time != 'Evening' && $evt_start->format('H:i') != $start_time) {
        return;
    } else if ($start_time == 'Evening') {
        if ($evt_start < $evening_time) {
            return;
        }
        $time = '<span class="text-mute">' . $evt_start->format('H:i') .': </span>';
    }
    list($abbr, $title) = explode(' ', $event->title, 2);
    $location = $event->location;

    // DIRTY HACK
    if ($abbr == 'SC1') {
       $location = 'Forum 1';
    }
    if ($abbr == 'SC2') {
       $location = 'Forum 2';
    }

    $color = $event->color;
    $id = $event->coll_id;
    $instructor = $instructors[$abbr];

    echo sprintf('<a href="./details/detail%s.html" class="list-group-item">' .
                    '<div>%s<span class="label" style="background-color:%s;">%s</span> <strong>%s</strong><span class="badge pull-right">%s</span></div>' .
                    '<div><small>%s</small></div>' .
                    '</a>',
                 $id, $time, substr($color, 0, 7), $abbr, $instructor, $location, $title);
}

function fluid_if_fullscreen() {
    return !isset($_GET['fullscreen']) ? 'fluid-container' : 'container';
}

$chat = read_shouts();
$schedule_json = read_schedule();
$schedule = filter_schedule($schedule_json, $TODAY);
$schedule_copy = $schedule;

?><!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Today's IK Schedule</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="./js/jquery-3.1.1.min.js"></script>
        <script src="./js/bootstrap-3.3.7.min.js"></script>
        <link href="./css/bootstrap-3.3.7.min.css" rel="stylesheet">
        <script type="text/javascript" src="./js/coolclock.js"></script>
        <script type="text/javascript" src="./js/ikterminal.js"></script>
        <script type="text/javascript">
            const loader = function() {
                CoolClock.findAndCreateClocks();
                refreshBySchedule('shoutbox', 5);
                refreshBySchedule('impression', 20);
                document.getElementById('shoutboxmessage').addEventListener('onkeydown', sendShoutbox);
                document.getElementById('shoutboxform').addEventListener('submit', submitShoutbox);
            };
        </script>
        <style type="text/css">
        </style>
    </head>
    <body onload="loader();">
        <div class="<?= fluid_if_fullscreen(); ?>">
            <div class="page-header">
                <h1>IK <?php echo $start_date->format('Y'); ?> <small>Day <?php echo $current_day; ?></small><small class="pull-right"><a href="http://guenne.ik">http://guenne.ik</a></small></h1>
            </div>

            <div class="row">
                <div class="col-xs-12 col-sm-12 col-md-9">
                <div class="fluid-container">
                        <div class="row hidden-md hidden-lg">
                            <?php foreach ($TIMES as $start_time => $end_time) : ?>
                            <div class="col-xs-12 col-sm-12">
                                <div class="list-group">
                                    <a href="" class="list-group-item active"><strong><?= $start_time ?> &ndash; <?= $end_time ?></strong></a>
                                    <?php foreach ($schedule as $event) { event_group_list_item($event, $start_time, $evening_date, $INSTRUCTORS); } ?>
                                </div>
                            </div>
                            <?php endforeach ?>
                        </div>
                        <div class="row hidden-sx hidden-sm">
                            <?php foreach ($TIMES as $start_time => $end_time) : ?>
                            <div class="col-md-2 col-lg-2 <?php if ($start_time == '09:00') { echo 'col-md-offset-1 col-lg-offset-1'; } ?>">
                                <div class="list-group">
                                    <a href="" class="list-group-item active"><strong><?= $start_time ?> &ndash; <?= $end_time ?></strong></a>
                                    <?php foreach ($schedule as $event) { event_group_list_item($event, $start_time, $evening_date, $INSTRUCTORS); } ?>
                                </div>
                            </div>
                            <?php endforeach ?>
                        </div>
                    </div>
                </div>

                <div class="col-xs-12 col-sm-12 col-md-3 panel panel-default">
                        <div class="panel-heading hidden-xs hidden-sm">Shoutbox</div>
                        <form action="shoutbox.php" method="post" id="shoutboxform">
                            <input type="text" id="shoutboxmessage" name="msg" accesskey="s" placeholder="message" style="width:100%;">
                        </form>
                        <div class="fluid-container" style="height: 13em; overflow-y: auto;">
                            <table id="shoutbox" class="table table-condensed">
                            <?php foreach ($chat as $line) : list($time, $ip, $msg) = explode(' ', $line, 3) ?>
                                <tr>
                                    <td width="20" bgcolor="<?= substr(md5($ip), 0, 6); ?>"></td>
                                    <td><span class="text-muted"><?= date('d. H:i', $time) ?></span> <?= trim($msg); ?></td>
                                </tr>
                            <?php endforeach ?>
                            </table>
                        </div>
                </div>
            </div>
        </div>

        <div class="<?= fluid_if_fullscreen(); ?>">
            <div class="row well">
                <!-- link box -->
                <div class="col-xs-12 col-sm-12 col-md-4">
                    <div class="text-center">
                        <ul class="list-inline">
                            <li><a href="http://guenne.ik/slides">http://guenne.ik/slides</a></li>
                            <li><a href="http://guenne.ik/images">http://guenne.ik/images</a></li>
                            <li><a href="https://www.facebook.com/groups/270641113015786/?fref=nf">IK Facebook Group</a></li>
                            <li>Please upload your slides here: <a href="http://guenne.ik/incoming">http://guenne.ik/incoming</a></li>
                        </ul>
                    </div>
                    <div class="panel">
                        <div class="panel-header"><h4>Announcements</h4></div>
                        <div class="panel-body">
                            <p>Do you have images from IK? Please share with us. <br>&ndash; Jochen and Michael</p>
                            <p>Hate paywalls? Paste the URL into <a href="http://sci-hub.io">sci-hub.io</a>.</p>
                        </div>
                    </div>
                </div>

                <!-- picture box -->
<?php
$path = 'thumbs/';

function getImagesFromDir($path) {
    $images = array();
    if ( $img_dir = @opendir($path) ) {
        while ( false !== ($img_file = readdir($img_dir)) ) {
            // checks for gif, jpg, png
            if ( preg_match("/(\.gif|\.jpg|\.png|\.JPG)$/", $img_file) ) {
                $images[] = $img_file;
            }
        }
        closedir($img_dir);
    }
    return $images;
}

function getRandomFromArray($ar) {
    mt_srand( (double)microtime() * 1000000 ); // php 4.2+ not needed
    $num = array_rand($ar);
    return $ar[$num];
}


$imgList = getImagesFromDir($path);

$img = getRandomFromArray($imgList);
?>
                <div class="col-sm-12 col-md-4 hidden-xs text-center">
                    <a href="#" class="thumbnail">
                        <img src="<?php echo $path . $img ?>" alt="IK Impression" id="impression">
                    </a>
                </div>

                 <!-- clock box -->
                <div class="col-md-4 hidden-sm hidden-xs text-center">
                    <canvas id="clockid" class="CoolClock:noSeconds" width="170" height="170" style="width: 170px; height: 170px;"></canvas>
                </div>

                <!-- other -->
                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            </div>


        </div>
    </body>
</html>
