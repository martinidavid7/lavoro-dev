<?php

namespace App\Providers;

use Illuminate\Foundation\Console\ServeCommand;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // On Windows, `php artisan serve` drops TEMP/TMP from the server's environment, so
        // PHP falls back to C:\Windows\Temp, which is not writable, and file uploads fail.
        ServeCommand::$passthroughVariables[] = 'TEMP';
        ServeCommand::$passthroughVariables[] = 'TMP';
    }
}
