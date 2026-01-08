<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
class ChatController extends Controller
{
    // Список всех чатов с пользователями и сообщениями
    public function index()
    {
        $user = Auth::user();
        // Загружаем только чаты, в которых состоит пользователь
        $chats = $user->chats()->with(['users', 'messages.user'])->get();
        $users = User::all();

        return Inertia::render('Chats/Index', [
            'chats' => $chats,
            'users' => $users,
            'auth' => ['user' => $user],
        ]);
    }

  public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description'=> 'required|string|max:255',
            'user_ids' => 'array',
        ]);

        $chatData = ['name' => $request->name,'description' => $request->description];

        // Обработка изображения
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = public_path('images');

            if (!file_exists($path)) {
                mkdir($path, 0755, true);
            }

            $file->move($path, $filename);
            $chatData['image'] = "images/$filename";
        }

        $chat = Chat::create($chatData);

        // Добавляем создателя в чат
        $chat->users()->attach(Auth::id());

        // Добавляем выбранных пользователей
        if ($request->has('user_ids')) {
            $chat->users()->attach($request->user_ids);
        }

        return redirect()->back();
    }

    // Добавление участника в чат
    public function addUser(Request $request, Chat $chat)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user_id;

        // Проверяем, что пользователь еще не состоит в чате
        if (!$chat->users->contains($userId)) {
            $chat->users()->attach($userId);
        }

        return redirect()->back();
    }
public function leave(Chat $chat)
{
    $user = Auth::user();

    if ($chat->users->contains($user->id)) {
        $chat->users()->detach($user->id);
    }

    return redirect()->back()->with('success', 'Вы покинули чат');
}

public function update(Request $request, Chat $chat)
{
    $request->validate([
        'name' => 'required|string|max:10000',
        'description' => 'nullable|string|max:1000',
        'avatar' => 'nullable|image|max:2048',
    ]);

    if ($request->hasFile('avatar')) {
        $file = $request->file('avatar');
        $filename = time() . '_' . $file->getClientOriginalName();
        $file->move(public_path('avatars'), $filename);
        $chat->image = '/avatars/' . $filename;
    }

    $chat->name = $request->name;
    $chat->description = $request->description;
    $chat->save();

    return response()->noContent();
}
    // Отправка сообщения в чат
public function sendMessage(Request $request, Chat $chat)
{
    $request->validate([
        'body' => 'required|string',
    ]);

    $body = $request->body;

    // Обработка вставки изображения через @img="ссылка"
    $body = preg_replace_callback(
        '/@img="([^"]+)"/',
        function ($matches) {
            $url = $matches[1]; // не экранируем
            return '<img src="' . $url . '" style="max-width:100%;"/>';
        },
        $body
    );

    // Обработка ссылок вида @link="URL" текст @endlink
    $body = preg_replace_callback(
        '/@link="([^"]+)"\s*(.*?)\s*@endlink/s',
        function ($matches) {
            $url = $matches[1];   // не экранируем
            $text = $matches[2];  // оставляем HTML
            return '<a href="' . $url . '" target="_blank" rel="noopener noreferrer">' . $text . '</a>';
        },
        $body
    );

    $message = $chat->messages()->create([
        'user_id' => Auth::id(),
        'body' => $body,
    ]);
    return response()->noContent();
}

    // Загрузка файла в public/chats и возвращение ссылки
public function uploadFile(Request $request, Chat $chat)
{
    $request->validate([
        'file' => 'required|file|max:10240' // максимум 10 МБ
    ]);

    $file = $request->file('file');
    $filename = time() . '_' . $file->getClientOriginalName();
    $path = public_path('chat_files'); // директория в public

    // Создаем директорию, если не существует
    if (!file_exists($path)) {
        mkdir($path, 0755, true);
    }

    $file->move($path, $filename); // сохраняем файл

    $url = asset("chat_files/$filename");

    return response()->json(['url' => $url]);
}

    // Получение сообщений конкретного чата (для автообновления)
    public function getMessages(Chat $chat)
    {
        $chat->load(['messages.user']);
        return response()->json([
            'messages' => $chat->messages,
        ]);
    }
}
