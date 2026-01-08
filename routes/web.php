<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\messagecontroller;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
Route::middleware('auth')
     ->get('/messages/{user}', [MessageController::class, 'index'])
     ->name('messages.index');

Route::get('/posts', [ApiController::class, 'index']);
Route::get('/post/{id}', [ApiController::class, 'post']);

Route::get('/', [MusicController::class, 'dashboard'])->name('home');

Route::get('/dashboard', [MusicController::class, 'dashboard'])->name('dashboard');

Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin');

Route::get('/dashboard/{id}', [MusicController::class, 'cardviewer']);
Route::get('/profile/{id}', [MusicController::class, 'profileviewer']);
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/subscriptions/toggle/{targetUserId}', [MusicController::class, 'toggleSubscription']);


    Route::delete('/post/delete/{targetUserId}', [MusicController::class, 'deletepost']);

    Route::post('/post/agree/{targetUserId}', [AdminController::class, 'agreepost']);
    Route::post('/post/decline/{targetUserId}', [AdminController::class, 'declinepost']);


    Route::get('/musics', [MusicController::class, 'index'])->name('music');
    Route::post('/musics', [MusicController::class, 'store'])->name('music.post');

    Route::get('/videos', [VideoController::class, 'index'])->name('video');
    Route::post('/videos', [VideoController::class, 'store'])->name('video.post');


    Route::get('/images', [ImageController::class, 'index'])->name('image');
    Route::post('/images', [ImageController::class, 'store'])->name('images.post');

    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');

    Route::post('/dashboard', [MusicController::class, 'dashstore'])->name('dashboard.post');

    Route::get('message/{id}', [messagecontroller::class, 'receivedMessages'])
    ->name('message');
    Route::post('/message/{id}', [MessageController::class, 'store']);

    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');

});
Route::post('/cards/{card}/like', [MusicController::class, 'toggleLike']);
Route::post('/cards/{card}/like2', [MusicController::class, 'toggleLike2']);
Route::put('/dashboard/{card}', [MusicController::class, 'dashUpdate'])->name('dashboard.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::post('/friends/request/{friendId}', [FriendController::class, 'sendRequest'])->name('friends.request');
    Route::post('/friends/accept/{id}', [FriendController::class, 'acceptRequest'])->name('friends.accept');
    Route::post('/friends/decline/{id}', [FriendController::class, 'declineRequest'])->name('friends.decline');
    Route::post('/friends/send/{friendId}', [FriendController::class, 'sendRequest']);
});
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
// Список всех чатов
Route::get('/chats', [ChatController::class, 'index'])
    ->name('chats.index')
    ->middleware('auth');

// Создание нового чата
Route::post('/chats', [ChatController::class, 'store'])
    ->name('chats.store')
    ->middleware('auth');

// Отправка сообщения в чат
Route::post('/chats/{chat}/messages', [ChatController::class, 'sendMessage'])
    ->name('chats.sendMessage')
    ->middleware('auth');

// Загрузка файла для чата
Route::post('/chats/{chat}/upload', [ChatController::class, 'uploadFile'])
    ->name('chats.uploadFile')
    ->middleware('auth');

// Получение сообщений чата (для автообновления через AJAX)
Route::get('/chats/{chat}/messages', [ChatController::class, 'getMessages'])
    ->name('chats.getMessages')
    ->middleware('auth');
Route::post('/chats/{chat}/add-user', [ChatController::class, 'addUser'])->name('chats.addUser');
Route::post('/chats/{chat}/update', [ChatController::class, 'update'])->name('chats.update');
Route::post('/chats/{chat}/leave', [ChatController::class, 'leave'])->name('chats.leave');
