<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Str;

class Certificate extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'certificates';

    protected $fillable = [
        'user_id',
        'roadmap_id',
        'certificate_code',
        'issued_at',
    ];

    protected $appends = ['id'];

    public function roadmap()
    {
        return $this->belongsTo(Roadmap::class, 'roadmap_id', '_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', '_id');
    }

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->certificate_code)) {
                $model->certificate_code = strtoupper(Str::random(12));
            }
            if (empty($model->issued_at)) {
                $model->issued_at = now();
            }
        });
    }
}
