<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    use DocumentModel;

    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';

    protected $primaryKey = '_id';
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'token',
        'abilities',
        'last_used_at',
        'expires_at',
        'tokenable_id',
        'tokenable_type',
    ];

    protected $casts = [
        'abilities'    => 'array',
        'last_used_at' => 'datetime',
        'expires_at'   => 'datetime',
    ];

    protected $hidden = [
        'token',
    ];

    /**
     * Get the tokenable model that the access token belongs to.
     */
    public function tokenable()
    {
        return $this->morphTo('tokenable', 'tokenable_type', 'tokenable_id');
    }

    /**
     * Find the token instance matching the given token.
     */
    public static function findToken($token)
    {
        if (strpos($token, '|') === false) {
            return static::where('token', hash('sha256', $token))->first();
        }

        [$id, $token] = explode('|', $token, 2);

        if ($instance = static::find($id)) {
            return hash_equals($instance->token, hash('sha256', $token)) ? $instance : null;
        }

        return null;
    }

    /**
     * Determine if the token has a given ability.
     */
    public function can($ability): bool
    {
        return in_array('*', $this->abilities ?? []) ||
               in_array($ability, $this->abilities ?? []);
    }

    /**
     * Determine if the token is missing a given ability.
     */
    public function cant($ability): bool
    {
        return !$this->can($ability);
    }
}
