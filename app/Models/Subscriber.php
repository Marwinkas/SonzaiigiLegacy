<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscriber extends Model
{
    protected $fillable = ['user_id', 'target_user_id'];
    public function subscriber()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subscribedTo()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
