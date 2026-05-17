<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class UserStats extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'user_stats';

    protected $fillable = [
        'user_id',
        'xp',
        'level',
        'streak',
        'last_active',
        'badges',
    ];

    protected $casts = [
        'xp'          => 'integer',
        'level'       => 'integer',
        'streak'      => 'integer',
        'last_active' => 'datetime',
        'badges'      => 'array',
    ];

    /**
     * Get or create stats for a user.
     */
    public static function forUser(string $userId): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId],
            [
                'xp'          => 0,
                'level'       => 1,
                'streak'      => 0,
                'last_active' => now(),
                'badges'      => [],
            ]
        );
    }

    /**
     * Add XP and recalculate level.
     */
    public function addXp(int $amount): void
    {
        $this->xp += $amount;
        $this->level = (int) floor($this->xp / 100) + 1;
        $this->save();
    }
}
