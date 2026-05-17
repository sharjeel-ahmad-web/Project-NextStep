<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Progress extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'progress';

    protected $fillable = [
        'user_id',
        'roadmap_id',
        'completed_nodes',
        'videos_watched',
        'passed_quizzes',
        'node_activity',
        'practice_tasks',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'completed_nodes' => 'array',
        'videos_watched'  => 'array',
        'passed_quizzes'  => 'array',
        'node_activity'   => 'array',
        'practice_tasks'  => 'array',
        'started_at'      => 'datetime',
        'completed_at'    => 'datetime',
    ];
}
