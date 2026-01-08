<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'photo',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }
    public function videos()
    {
        return $this->hasMany(Video::class, 'user_id');
    }

    // Добавить связь для получения полученных сообщений
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function friends()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
            ->wherePivot('status', 'accepted');
    }

    public function friendRequests()
    {
        return $this->hasMany(Friendship::class, 'friend_id')
            ->where('status', 'pending');
    }
    public function cards() {
        return $this->hasMany(Card::class, 'user_id');
    }
        public function likes()
    {
        return $this->hasMany(Like::class);
    }
         public function subscribers()
    {
        return $this->hasMany(Subscriber::class);
    }
        public function chats()
    {
        return $this->belongsToMany(Chat::class, 'chat_user');
    }
}
