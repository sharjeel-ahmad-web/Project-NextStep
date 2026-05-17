<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Roadmap extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'roadmaps';

    protected $appends = ['id'];

    protected $fillable = [
        'user_id',
        'target_role',
        'description',
        'current_skills',
        'skill_gaps',
        'language',
        'nodes',
        'status',
    ];

    protected $casts = [
        'current_skills' => 'array',
        'skill_gaps'     => 'array',
        'nodes'          => 'array',
    ];

    public function certificates()
    {
        return $this->hasMany(Certificate::class, 'roadmap_id', '_id');
    }
}
