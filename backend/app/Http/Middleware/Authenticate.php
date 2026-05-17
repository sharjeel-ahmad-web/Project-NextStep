<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * For API calls we return 401 JSON instead of redirecting to a login route.
     */
    protected function redirectTo($request): ?string
    {
        return null;
    }
}
