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

$START = '2019-03-12';
$END = '2019-03-19';
$TODAY = date('Y-m-d');
$NOW = date('H:i');

$START_DATE = new DateTimeImmutable($START . ' 00:00');
$END_DATE = new DateTimeImmutable($END . ' 24:00');
$TODAY_DATE = new DateTimeImmutable($TODAY . ' 00:00');

$CURRENT_DAY = $TODAY_DATE->add(new DateInterval('P1D'))->diff($START_DATE)->format('%a');
if ($TODAY_DATE < $START_DATE) {
    $CURRENT_DAY = -1 * $CURRENT_DAY -1;
}
$IK_DAYS = $START_DATE->diff($END_DATE)->format('%a');


/** Schedule **/

// Read ?day=X. X can be a number between 1 and 8 (inclusive) to denote the IK
// day. Alternatively, X can be a date (e.g. 2018-03-12) to denote a date. If
// day is not provided, the current day is used.
$SCHEDULE_DAY = $TODAY;
if (isset($_GET['day'])) {
    $day = urlencode($_GET['day']);
    if (strlen($day) == 1 && 1 <= (int) $day && (int) $day <= $IK_DAYS) {
        $SCHEDULE_DAY = date('Y-m-d', strtotime($START . ' -1 day +' . $day . ' day'));
    } else {
        $SCHEDULE_DAY = date('Y-m-d', strtotime($day));
    }
}
$EVENING_DATE = new DateTimeImmutable($SCHEDULE_DAY . ' 18:00');
$VIEW_DAY = $EVENING_DATE->add(new DateInterval('P1D'))->diff($START_DATE)->format('%a');
if (!isset($_GET['day']) && $TODAY_DATE < $START_DATE) {
    $VIEW_DAY = $CURRENT_DAY;
}

function read_schedule() {
    return json_decode(file_get_contents('ikschedule.json'))->events;
}

function sort_schedule($schedule) {
    function comparison($l, $r) {
        $comp = strcmp($l->start, $r->start);
        if ($comp) {
            return $comp;
        }
        $comp = strcmp($l->end, $r->end);
        if ($comp) {
            return $comp;
        }
        return strcmp($l->title, $r->title);
    }
    uasort($schedule, 'comparison');
    return $schedule;
}

// assumes a sorted array
function add_counts($schedule) {
    $counts = array();
    foreach ($schedule as $key => $value) {
        $coll_id = $value->coll_id;
        if (array_key_exists($coll_id, $counts)) {
            $counts[$coll_id] = $counts[$coll_id] + 1;
        } else {
            $counts[$coll_id] = 1;
        }
        $value->nth_session = $counts[$coll_id];
    }

    foreach ($schedule as $key => $value) {
        $value->num_sessions = $counts[$value->coll_id];
    }

    return $schedule;
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
    }
    if ($start_time == 'Evening' && ($evt_start < $evening_time || strpos($event->title, $IKHACK) !== false)) {
        return;
    }
    if ($start_time == $IKHACK && strpos($event->title, $IKHACK) === false) {
        return;
    }
    if ($start_time != $IKHACK && strpos($event->title, $IKHACK) !== false) {
        return;
    }
    if ($start_time == 'Evening' || $start_time == $IKHACK) {
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
            $instructor = $event->title;
            $title = '';
        }
    } elseif (strpos($event->title, $instructor) !== false) {
        // Instructor is present and inside the title: explode it
        list(, $instructor, $title) = explode('-', $title, 3);
    }



    // Determine event color, overwrite white
    $color = $event->color != '#ffffffff' ? $event->color : $event->colorInactive;

    // If the number of sessions is bigger than 1, add a sessioncount
    if ($event->num_sessions > 1) {
        $sessioncount = ' (' . $event->nth_session . '/' . $event->num_sessions . ')';
    } else {
        $sessioncount = '';
    }

    printf('<div class="event%s" data_id="%s">' .
               '<a href="./details/detail%s.html">' .
                   '<span class="lecture_id" style="background-color: %s;">%s</span>' .
                   '<span class="lecturer"><input type="checkbox" value="%s" />%s%s</span>' .
                   '<span class="location" style="background-color: %s;">%s</span>' .
                   '<span class="title">%s</span>' .
               '</a>' .
           '</div>',
           is_active_event($now, $evt_start->format('H:i'), $evt_end->format('H:i')) ? ' active' : '',
           $id, $id, $color, $time ? $time : $abbr, $id, $instructor, $sessioncount,
           $color, $location, $title);
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
    printf('<a href="%s" class="%s%s">%s</a>',
        $day == $CURRENT_DAY ? '/' : ('/?day=' . $day),
        $day == $CURRENT_DAY ? 'active' : '',
        $day == $VIEW_DAY ? ' disabled' : '',
        $day);
}

$schedule = read_schedule();
$schedule = sort_schedule($schedule);
$schedule = add_counts($schedule);
$schedule = filter_schedule($schedule, $SCHEDULE_DAY);

?>
