<?php

date_default_timezone_set('Europe/Berlin');

/** Constants **/

$IKHACK = '/ik/hack';
$TIMES = array(
    '09:00' => '10:30',
    '11:00' => '12:30',
    '14:30' => '16:00',
    '16:30' => '18:00',
    'Evening' => '',
    $IKHACK => '');

$START = '2018-03-09';
$END = '2018-03-16';
$TODAY = date('Y-m-d');
$NOW = date('H:i');

$START_DATE = new DateTimeImmutable($START . ' 00:00');
$END_DATE = new DateTimeImmutable($END . ' 24:00');
$TODAY_DATE = new DateTimeImmutable($TODAY . ' 00:00');

$CURRENT_DAY = $TODAY_DATE->add(new DateInterval('P1D'))->diff($START_DATE)->format('%a');
$IK_DAYS = $START_DATE->diff($END_DATE)->format('%a');


/** Schedule **/

// Read ?day=X. X can be a number between 1 and 8 (inclusive) to denote the IK
// day. Alternatively, X can be a date (e.g. 2018-03-12) to denote a date. If
// day is not provided, the current day is used.
$SCHEDULE_DAY = $TODAY;
if (isset($_GET['day'])) {
    $day = urlencode($_GET['day']);
    if (strlen($day) == 1 && 1 <= (int) $day && (int) $day <= 8) {
        $SCHEDULE_DAY = date('Y-m-d', strtotime($START . ' -1 day +' . $day . ' day'));
    } else {
        $SCHEDULE_DAY = date('Y-m-d', strtotime($day));
    }
}
$EVENING_DATE = new DateTimeImmutable($SCHEDULE_DAY . ' 18:00');
$VIEW_DAY = $EVENING_DATE->add(new DateInterval('P1D'))->diff($START_DATE)->format('%a');

function read_schedule() {
    return json_decode(file_get_contents('ikschedule.json'))->events;
}

function filter_schedule($schedule, $day) {
    return array_filter($schedule, function ($element) use ($day) {
        $start_datetime = new DateTime($element->start);
            return $start_datetime->format('Y-m-d') == $day;
        });
}

function event_group_list_item($event, $start_time, $evening_time, $now) {
    global $IKHACK;
    $evt_start = new DateTime($event->start);
    $evt_end   = new DateTime($event->end);

    // Check time and return if not in the correct time slot.
    if ($start_time != 'Evening' && $start_time != $IKHACK && $evt_start->format('H:i') != $start_time) {
        return;
    } else if ($start_time == 'Evening' || $start_time == $IKHACK) {
        if ($start_time == 'Evening' && $evt_start < $evening_time) {
            return;
        } else if ($start_time == $IKHACK && strpos($event->title, $IKHACK) === false) {
            echo strpos($event->title, $IKHACK) . ' ';
            return;
        }
        // For evening events get the proper time (replaces the abbreviation)
        $time = $evt_start->format('H:i') . '&ndash;' . $evt_end->format('H:i');
    } else {
        $time = '';
    }

    // Default event meta data
    $id = $event->coll_id;
    $instructor = trim($event->instructor);
    $location = $event->location;

    list($abbr, $title) = explode(' ', $event->title, 2);
    $abbr = str_replace(':','',$abbr);

    // Special cases: event has no instructor
    if (!$instructor) {
        // Can be inside the title (e.g. /ik/hack)
        if (substr_count($title, '-') > 1) {
            list(, $instructor, $title) = explode('-', $title, 3);
        } else {  // Can be absent at all (then the title explosion above was faulty, so we fix it):
            $title = $event->title;
        }
    }

    // Determine event color, overwrite white
    $color = $event->color != '#ffffffff' ? $event->color : $event->colorInactive;

    printf('<div class="event%s">' .
               '<a href="./details/detail%s.html">' .
                   '<span class="lecture_id" style="background-color: %s;">%s</span>' .
                   '<span class="lecturer">%s</span>' .
                   '<span class="location" style="background-color: %s;">%s</span>' .
                   '<span class="title">%s</span>' .
               '</a>' .
           '</div>',
           is_active_event($now, $evt_start->format('H:i'), $evt_end->format('H:i')) ? ' active' : '',
           $id, $color, $time ? $time : $abbr, $instructor, $color, $location, $title);
}

function is_active_timeslot($now, $start, $end) {
    if ($start == 'Evening') {
        return $now > '18:00';
    }
    return is_active_event($now, $start, $end);
}

function is_active_event($now, $start, $end) {
    return $start <= $now && $now < $end;
}

function create_swapDay_button($day) {
    global $CURRENT_DAY, $VIEW_DAY;
    printf('<button onclick="swapDay(%s);"%s%s>%s</button>',
        $day == $CURRENT_DAY ? '' : $day,
        $day == $CURRENT_DAY ? ' class="active"' : '',
        $day == $VIEW_DAY ? ' disabled="disabled"' : '',
        $day);
}

$schedule_json = read_schedule();
$schedule = filter_schedule($schedule_json, $SCHEDULE_DAY);


/** Shoutbox **/

function read_shouts() {
    $chat = file_get_contents('CHAT');
    $chat = explode(PHP_EOL, $chat);
    $chat = array_reverse($chat);
    unset($chat[0]);
    return $chat;
}

$chat = read_shouts();


/** Random impression image **/

function getImagesFromDir($path) {
    $images = array();
    if ( $img_dir = @opendir($path) ) {
        while ( false !== ($img_file = readdir($img_dir)) ) {
            if ( preg_match("/(\.gif|\.jpg|\.png|\.JPG)$/", $img_file) ) {
                $images[] = $img_file;
            }
        }
        closedir($img_dir);
    }
    return $images;
}

function getRandomFromArray($ar) {
    $num = array_rand($ar);
    return $ar[$num];
}

$path = 'thumbs/';
$imgList = getImagesFromDir($path);
$img = getRandomFromArray($imgList);

?><!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Today's IK Schedule</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script type="text/javascript" src="/js/ikterminal.js"></script>
        <link rel="stylesheet" type="text/css" href="/css/style.css">
    </head>
    <body onload="loader();" id="body">

        <header>
            <h1>
                IK<?= $START_DATE->format('Y'); ?>
                <small>Day <?= $CURRENT_DAY; ?></small>
                <?php if ($TODAY !== $SCHEDULE_DAY) : ?>
                <span id="previewday">(Day <?= $VIEW_DAY ?>)</span>
                <?php endif ?>
            </h1>
            <h1>
                <small><a href="/">http://guenne.ik</a></small>
                <span id="time"></span>
            </h1>
        </header>

        <main>
            <section id="daytoggler">
                <?php for ($i = 1; $i <= $IK_DAYS; ++$i)  {
                    create_swapDay_button($i);
                } ?>
            </section>

            <section id="schedule">
                <?php foreach ($TIMES as $start_time => $end_time) : ?>
                    <div class="timeslot" <?= is_active_timeslot($NOW, $start_time, $end_time) ? 'id="timeslot_active"' : '' ?>>
                        <p><?= $start_time . ($end_time !== '' ? ' &ndash; ' . $end_time : '') ?></p>
                        <?php foreach ($schedule as $event) { event_group_list_item($event, $start_time, $EVENING_DATE, $NOW); } ?>
                    </div>
                <?php endforeach ?>
            </section>

            <section id="announcements">
                <h3>Announcements</h3>
                <p style="color:red;">Checkout until 9am! Return your keys and don't forget your luggage.</p>
                <p style="color:red;">First bus arrives at 10:30am (and leaves when full), the second one leaves at 11am.</p>
            </section>

            <section id="information">
                <h3>Information</h3>
                <p>Do you have images from IK? Please share with Jochen or Michael.</p>
                <p>Hate paywalls? Paste the URL into <a href="https://sci-hub.la">sci-hub.la</a>.</p>
                <p>Please upload your slides here: <a href="/incoming">http://guenne.ik/incoming</a></p>
            </section>

            <section id="impressions">
                <a href="/images">
                    <img src="<?php echo $path . $img ?>" alt="IK Impression" id="impression" />
                </a>
            </section>

            <aside id="shoutbox">
                <h3>Shoutbox</h3>
                <form action="shoutbox.php" method="post" id="shoutboxform">
                    <input type="text" id="shoutboxmessage" name="msg" accesskey="s" placeholder="message" />
                </form>
                <div id="shoutbox_container">
                    <?php foreach ($chat as $line) : list($time, $ip, $msg) = explode(' ', $line, 3) ?>
                        <p><span class="message_box" style="background-color:#<?= substr(md5($ip), 0, 6); ?>;"></span><span><?= date('d. H:i', $time) ?></span> <?= trim($msg); ?></p>
                    <?php endforeach ?>
                </div>
            </aside>
        </main>

        <footer>
            <ul>
                <li><a href="/slides">http://guenne.ik/slides</a></li>
                <li><a href="/images">http://guenne.ik/images</a></li>
                <li><a href="https://www.facebook.com/groups/270641113015786/?fref=nf">IK Facebook Group</a></li>
            </ul>
        </footer>

    </body>
</html>
