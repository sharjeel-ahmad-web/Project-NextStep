<?php

return [
    App\Providers\AppServiceProvider::class,
    MongoDB\Laravel\MongoDBServiceProvider::class,
    MongoDB\Laravel\Auth\PasswordResetServiceProvider::class,
    Laravel\Sanctum\SanctumServiceProvider::class,
];
