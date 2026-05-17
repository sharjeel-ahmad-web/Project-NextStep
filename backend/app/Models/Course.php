<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\HasMany;

class Course extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'courses';

    protected $fillable = [
        'title',
        'description',
        'instructor_id',
        'category',
        'level',
        'duration_hours',
        'price',
        'image_url',
        'is_published',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'duration_hours' => 'integer',
            'price' => 'float',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'course_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'course_id');
    }
}
