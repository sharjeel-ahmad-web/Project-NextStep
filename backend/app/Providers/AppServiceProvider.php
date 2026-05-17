<?php

namespace App\Providers;

use App\Services\PracticeTaskService;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PracticeTaskService::class, fn () => new PracticeTaskService());

        // Force our custom MongoDB-friendly Password Broker
        $this->app->singleton('auth.password', function ($app) {
            return new \App\Auth\MongoPasswordBrokerManager($app);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Use our custom MongoDB-backed PersonalAccessToken model
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }





}
