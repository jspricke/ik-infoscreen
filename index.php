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
                    '<div>%s<span class="label" style="background-color:%s;">%s</span> <strong>%s</strong><span class="badge pull-right">%s</span></div><div style="clear:both;"></div>' .
                    '<div><small>%s</small></div>' .
                    '</a>',
                 $id, $time, substr($color, 0, 7), $abbr, $instructor, $location, $title);
}

function fluid_if_fullscreen() {
    return !isset($_GET['fullscreen']) ? 'container-fluid' : 'container';
}

$chat = read_shouts();
$schedule_json = read_schedule();
$schedule = filter_schedule($schedule_json, $TODAY);
$schedule_copy = $schedule;

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
?><!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Today's IK Schedule</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="./js/jquery-3.1.1.min.js"></script>
        <script src="./js/bootstrap-3.3.7.min.js"></script>
        <link href="./css/bootstrap-3.3.7.min.css" rel="stylesheet">
        <script type="text/javascript" src="./js/clock.js"></script>
        <script type="text/javascript" src="./js/ikterminal.js"></script>
        <script type="text/javascript">
            const loader = function() {
                startTime();
                refreshBySchedule('shoutbox', 'shoutbox-container', 5);
                refreshBySchedule('impression', 'impression-container', 20);
                document.getElementById('shoutboxmessage').addEventListener('onkeydown', sendShoutbox);
                document.getElementById('shoutboxform').addEventListener('submit', submitShoutbox);
            };
        </script>
        <style type="text/css">
		.col-xs-5ths,
		.col-sm-5ths,
		.col-md-5ths,
		.col-lg-5ths {
		    position: relative;
		    min-height: 1px;
		    padding-right: 20px;
		    padding-left: 0px;
                    font-size:120%;
		}

		.col-xs-5ths {
		    width: 20%;
		    float: left;
		}

		@media (min-width: 768px) {
		    .col-sm-5ths {
			width: 20%;
			float: left;
		    }
		}

		@media (min-width: 992px) {
		    .col-md-5ths {
			width: 20%;
			float: left;
		    }
		}

		@media (min-width: 1200px) {
		    .col-lg-5ths {
			width: 20%;
			float: left;
		    }
		}
		
		.footer-bottom {
			width: 100%;
			padding: 0;
			bottom: 10px;
			z-index: 1;
			height: 30px;
			position: absolute;
			text-align: center;
		}
        </style>
    </head>
    <body onload="loader();">
        <div class="<?= fluid_if_fullscreen(); ?>">
            <div class="page-header" style="margin-top: 0.5em; padding-bottom: 0;">
		<h1>IK <?php echo $start_date->format('Y'); ?><small style="margin-left: 1.5em;">Day <?php echo $current_day; ?></small> <span class="hidden-xs hidden-sm pull-right"><small style="margin-right: 1.5em;"><a href="http://guenne.ik">http://guenne.ik</a></small><span id="time"></span></span></h1>
            </div>

            <div class="row">
                <div class="col-xs-12 col-sm-12 col-md-9" style="padding:0;">
			<div class="container-fluid">
			    <?php foreach ($TIMES as $start_time => $end_time) : ?>
			    <div class="col-xs-12 col-sm-12 col-md-5ths col-lg-5ths">
				<div class="list-group">
				    <a href="" class="list-group-item active"><strong><?= $start_time ?> &ndash; <?= $end_time ?></strong></a>
				    <?php foreach ($schedule as $event) { event_group_list_item($event, $start_time, $evening_date, $INSTRUCTORS); } ?>
				</div>
			    </div>
			    <?php endforeach ?>
			</div>
		</div>
	
                <div class="col-xs-12 col-sm-12 col-md-3 panel panel-default" style="padding: 0 0 0 0; margin: 0 10px 0 -10px;">
                        <div class="panel-heading hidden-xs hidden-sm">Shoutbox</div>
                        <form action="shoutbox.php" method="post" id="shoutboxform">
                            <input type="text" id="shoutboxmessage" name="msg" accesskey="s" placeholder="message" style="width:100%;">
                        </form>
                        <div class="container-fluid" style="height: 36em; overflow-y: auto; overflow-x: hidden; padding-left:0; padding-right:0;" id="shoutbox-container">
                            <table class="table table-condensed" id="shoutbox">
                            <?php foreach ($chat as $line) : list($time, $ip, $msg) = explode(' ', $line, 3) ?>
                                <tr>
                                    <td width="20" bgcolor="<?= substr(md5($ip), 0, 6); ?>"></td>
                                    <td style="display: inline-block; width: 75%;"><span class="text-muted"><?= date('d. H:i', $time) ?></span> <?= trim($msg); ?></td>
                                </tr>
                            <?php endforeach ?>
                            </table>
                        </div>
                </div>
	    </div>

	    <div class="row">
		<div class="col-xs-12 col-sm-12 col-md-4">
                    <div class="panel" style="font-size:120%">
			<div class="panel-body" style="padding:0;">
				<h3 style="margin-top: .75em; margin-bottom: .5em;">Tonight: 15.03.</h3>
				<p>16.03. 1:15pm Diversity &amp; Inclusion Task Force in the Europa Saal</p>
				<p>SC&nbsp;1 will be in Forum&nbsp;1 and SC&nbsp;2 will be in Forum&nbsp;2</p>
				<p style="color: red;">Bring your <u>wallet</u> to lunch</p>
                        </div>
                    </div>
                </div>
		<div class="col-xs-12 col-sm-12 col-md-5">
                    <div class="panel" style="font-size:120%">
			<div class="panel-body" style="padding: 0;">
                            <h3 style="margin-top: .75em; margin-bottom: .5em;">Announcements</h3>
                            <p>Do you have images from IK? Please share with Jochen or Michael</p>
                            <p>Hate paywalls? Paste the URL into <a href="http://sci-hub.io">sci-hub.io</a>.</p>
                            <p>Please upload your slides here: <a href="http://guenne.ik/incoming">http://guenne.ik/incoming</a></p>
                        </div>
                    </div>
		</div>         

		<div class="col-md-3 hidden-xs hidden-sm text-center thumbnail" style="margin: 0 10px 0 -10px;">
                    <a href="http://guenne.ik/images" id="impression-container">
                        <img src="<?php echo $path . $img ?>" alt="IK Impression" id="impression">
                    </a>
                </div>
            </div>
        </div>

        <div class="<?= fluid_if_fullscreen(); ?>">
            <div class="footer-bottom">
                    <div class="text-center">
                        <ul class="list-inline">
                            <li><a href="http://guenne.ik/slides">http://guenne.ik/slides</a></li>
                            <li><a href="http://guenne.ik/images">http://guenne.ik/images</a></li>
                            <li><a href="https://www.facebook.com/groups/270641113015786/?fref=nf">IK Facebook Group</a></li>
                        </ul>
                    </div>
                </div>
            </div>
	</div>
    </body>
</html>
