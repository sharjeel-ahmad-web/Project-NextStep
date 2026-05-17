<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class Lesson extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'lessons';

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'content',
        'video_url',
        'duration_minutes',
        'order',
        'is_published',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'duration_minutes' => 'integer',
            'order' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
