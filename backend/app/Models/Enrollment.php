<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class Enrollment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'enrollments';

    protected $fillable = [
        'user_id',
        'course_id',
        'progress_percentage',
        'completed_lessons',
        'status',
        'enrolled_at',
        'completed_at',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'progress_percentage' => 'integer',
            'completed_lessons' => 'integer',
            'enrolled_at' => 'datetime',
            'completed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
