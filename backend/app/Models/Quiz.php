<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Quiz extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'quizzes';

    protected $fillable = [
        'video_id',
        'video_title',
        'skill_name',
        'questions', // Array of 10 MCQs
    ];

    protected $casts = [
        'questions' => 'array',
    ];
}
