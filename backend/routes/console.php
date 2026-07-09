<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-Reset Trending Setiap Hari Senin Jam 00:00 WIB
Schedule::command('db:seed --class=ResetViewsSeeder')->weeklyOn(1, '00:00')->timezone('Asia/Jakarta');