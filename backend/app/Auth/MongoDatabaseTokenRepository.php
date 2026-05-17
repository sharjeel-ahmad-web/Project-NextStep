<?php

namespace App\Auth;

use MongoDB\Laravel\Auth\DatabaseTokenRepository as BaseDatabaseTokenRepository;
use Illuminate\Support\Carbon;

class MongoDatabaseTokenRepository extends BaseDatabaseTokenRepository
{
    /**
     * Determine if the token has expired.
     *
     * @param  mixed  $createdAt
     * @return bool
     */
    protected function tokenExpired($createdAt)
    {
        return Carbon::parse($this->formatDate($createdAt))->addSeconds($this->expires)->isPast();
    }

    /**
     * Determine if the token was recently created.
     *
     * @param  mixed  $createdAt
     * @return bool
     */
    protected function tokenRecentlyCreated($createdAt)
    {
        if ($this->throttle <= 0) {
            return false;
        }

        return Carbon::parse($this->formatDate($createdAt))->addSeconds(
            $this->throttle
        )->isFuture();
    }

    /**
     * Format the date from MongoDB to something Carbon can parse.
     *
     * @param  mixed  $date
     * @return mixed
     */
    protected function formatDate($date)
    {
        if ($date instanceof \MongoDB\BSON\UTCDateTime) {
            return $date->toDateTime()->format('Y-m-d H:i:s');
        }

        if (is_array($date)) {
            if (isset($date['date'])) {
                return $date['date'];
            }
            // Handle MongoDB JSON-like array if necessary
            if (isset($date['$date']['$numberLong'])) {
                $milliseconds = (int) $date['$date']['$numberLong'];
                return date('Y-m-d H:i:s', $milliseconds / 1000);
            }
            
            // If it's an array but we don't know the format, just try to get a string out of it
            // or return current time as a fallback to prevent crash
            return now()->toDateTimeString(); 
        }

        return $date;
    }
}
