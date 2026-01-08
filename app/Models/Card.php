<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = ['title','user_id', 'imgurl', 'videourl', 'audiourl','status'];


    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
        public function likes()
    {
        return $this->hasMany(Like::class);
    }
    public function user() {
        return $this->belongsTo(User::class);
    }

         public function subscribers()
    {
        return $this->hasMany(Subscriber::class);
    }
}
