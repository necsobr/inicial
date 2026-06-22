<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-failed --hours=48')->daily();
Schedule::command('maps:remind')->dailyAt('08:00');
