<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Resume extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'resumes';

    protected $appends = ['id'];

    protected $fillable = [
        'user_id',
        'title',
        'target_role',
        'industry',
        'experience_level',
        'raw_prompt',
        'raw_input',
        'photo_url',
        'meta_data',
        'resume_data',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'resume_data' => 'array',
    ];
}
