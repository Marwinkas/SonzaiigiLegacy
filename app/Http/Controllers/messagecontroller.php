<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\Friendship;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class messagecontroller extends Controller
{

public function Message(Request $request, User $user)
{
    abort_if($user->is($request->user()), 404); // нельзя открыть чат с самим собой

    $messages = Message::with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
        ->where(function ($q) use ($user, $request) {
            $q->where('sender_id', $request->user()->id)
              ->where('receiver_id', $user->id);
        })
        ->orWhere(function ($q) use ($user, $request) {
            $q->where('sender_id', $user->id)
              ->where('receiver_id', $request->user()->id);
        })
        ->orderBy('created_at')
        ->get();

    return response()->json([
        'messages' => $messages,
    ]);
}


    public function receivedMessages($id)
    {
        $user2 = User::findOrFail($id)->id;

        // Получаем отправленные и полученные сообщения с подгрузкой связей
        $sentMessages = Auth::user()->sentMessages()
            ->where('receiver_id', $user2)
            ->with('sender', 'receiver')
            ->get();

        $receiveMessages = Auth::user()->receivedMessages()
            ->where('sender_id', $user2)
            ->with('sender', 'receiver')
            ->get();

        // Объединяем и сортируем
        $messages = $sentMessages->merge($receiveMessages)
            ->sortBy('created_at')
            ->values()
            ->toArray();

            $userId = Auth::id();

            $friendIds = Friendship::where(function ($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhere('friend_id', $userId);
            })
            ->where('status', 'accepted')
            ->get()
            ->map(function ($friendship) use ($userId) {
                return $friendship->user_id == $userId ? $friendship->friend_id : $friendship->user_id;
            });

            $users = User::whereIn('id', $friendIds)->get();
        // Передаем сообщения на страницу с использованием Inertia
        return Inertia::render('message/MyMessages', [
            'users' => $users,
            'messages' => $messages,
            'id' => $id
        ]);
    }
    public function store(Request $request,$id)
    {
        // Валидируем данные
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id', // Проверяем, что получатель существует
            'content' => 'required|string|min:1', // Проверяем, что сообщение не пустое
        ]);
        $userId = Auth::id();
        // Сохраняем сообщение
        $message = new Message();
        $message->sender_id = $userId; // предполагаем, что пользователь авторизован
        $message->receiver_id = $id;
        $message->content = $validated['content'];
        $message->save();

        // Возвращаем успешный ответ
        return redirect()->back();
    }
}
