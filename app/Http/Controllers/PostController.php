<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Friendship;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index()
    {
        return Card::with('user')->orderBy('created_at', 'desc')->get();
    }
    public function friends(Request $request)
    {
        $user   = $request->user();
        return $user->friends()->get();
    }

public function Message(Request $request, $id)
{
    $userId = $request->user()->id; // ID текущего пользователя
    $friend = User::findOrFail($id);
    $friendId = $friend->id;

    $messages = Message::with(['sender:id,name', 'receiver:id,name'])
        ->where(function ($q) use ($userId, $friendId) {
            $q->where('sender_id', $userId)
              ->where('receiver_id', $friendId);
        })
        ->orWhere(function ($q) use ($userId, $friendId) {
            $q->where('sender_id', $friendId)
              ->where('receiver_id', $userId);
        })
        ->orderBy('created_at')
        ->get();

    return $messages;
}
public function store(Request $request, $id)
{
    $validated = $request->validate([
        'content' => 'required|string|min:1',
    ]);

    $userId = $request->user()->id;

    $message = new Message();
    $message->sender_id = $userId;
    $message->receiver_id = $id; // получатель из маршрута
    $message->content = $validated['content'];
    $message->save();

    return response()->json([
        'success' => true,
        'message' => $message
    ]);
}
}
