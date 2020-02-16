<?php include('functions.php'); ?><!DOCTYPE html>
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
                IK<span id="year"></span>
                <small id="day"></small>
            </h1>
            <h1>
                <small><a href="/">http://guenne.ik</a></small>
                <span id="time"></span>
            </h1>
        </header>

        <main>
            <section id="schedule">
                <?php foreach ($TIMES as $start_time => $end_time) : ?>
                    <div class="timeslot" <?= is_active_timeslot($NOW, $start_time, $end_time) ? 'id="timeslot_active"' : '' ?>>
                        <h3><?= $start_time . ($end_time !== '' ? ' &ndash; ' . $end_time : '') ?></h3>
                        <?php foreach ($schedule as $event) { event_group_list_item($event, $start_time, $EVENING_DATE, $NOW); } ?>
                    </div>
                <?php endforeach ?>
            </section>

            <section id="tools">
                <div id="favtoggle">
                    <button id="favtoggler">Toggle favorites</button>
                </div>

                <div id="daytoggle">
                <?php for ($i = 1; $i <= $IK_DAYS; ++$i)  {
                    create_swapDay_button($i);
                } ?>
                </div>

                <div id="favport">
                    <button id="export">Export favorites</button>
                    <button id="import">Import favorites</button>
                    <button id="clear">Clear favorites</button>
                </div>
            </section>

            <section class="announcements">
                <h3>Announcements</h3>
                <p style="color:red;">Checkout until 9am! Return your keys and don't forget your luggage.</p>
                <p style="color:red;">First bus arrives at 10:30am (and leaves when full), the second one leaves at 11am.</p>
            </section>

            <section class="announcements">
                <h3>Information</h3>
                <p>Do you have images from IK? Please share with Jochen or Michael.</p>
                <p>Hate paywalls? Paste the URL into <a href="https://sci-hub.la">sci-hub.la</a>.</p>
                <p>Please upload your slides here: <a href="/incoming">http://guenne.ik/incoming</a></p>
            </section>

            <section id="impressions">
                <a href="/images">
                    <img src="<?= $path . $img ?>" alt="IK Impression" id="impression" />
                </a>
            </section>

            <aside id="shoutbox">
                <h3>Shoutbox</h3>
                <form action="shoutbox.php" method="post" id="shoutboxform">
                    <input type="text" id="shoutboxmessage" name="msg" accesskey="s" placeholder="message" />
                </form>
<template id="shoutbox_template">
    <p><span class="message_box"></span><span class="message"></span></p>
</template>
                <div id="shoutbox_container">
                </div>
            </aside>
        </main>

        <footer>
            <ul>
                <li><a href="/slides">Slides</a></li>
                <li><a href="/images">Images</a></li>
                <li><a href="https://www.facebook.com/groups/270641113015786/?fref=nf">IK Facebook Group</a></li>
                <li><a href="https://github.com/jspricke/ik-infoscreen">Source on Github</a></li>
            </ul>
        </footer>

    </body>
</html>
