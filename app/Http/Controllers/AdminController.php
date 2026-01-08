<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Like;
use App\Models\Songs;
use App\Models\Subscriber;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
class AdminController extends Controller
{
public function dashboard(Request $request)
{
    if(Auth::user() && Auth::user()-> role != 'admin'){
        return Inertia::location(route('dashboard'));
    }
    $search = $request->input('search');

    // Основные карточки (новые)
    $cardsQuery = Card::with('user')->orderBy('created_at', 'desc');

    if ($search) {
        $cardsQuery->where(function ($query) use ($search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        });
    }

    $cards = $cardsQuery->get();
    $randomCardIds = $cards->pluck('id');

    $user = Auth::user();
    $likedCardIds = [];

    if ($user) {
        $likedCardIds = Like::where('user_id', $user->id)
            ->whereIn('card_id', $randomCardIds)
            ->pluck('card_id')
            ->toArray();
    }

    $cards->transform(function ($card) use ($likedCardIds) {
        $card->liked = in_array($card->id, $likedCardIds);
        return $card;
    });

    return Inertia::render('Admin', [
        'cards' => $cards,
    ]);
}
public function dashUpdate(Request $request, Card $card)
{
    // --- 1. Валидация ---------------------------------------------------------
    $validated = $request->validate([
        'title'          => ['required', 'string', 'max:255'],
    ]);

    // --- 2. Парсим сохранённые ранее URL‑ы ------------------------------------
    $currentImgs   = $card->imgurl   ? explode(',', $card->imgurl)   : [];
    $currentAudios = $card->audiourl ? explode(',', $card->audiourl) : [];
    $currentVideos = $card->videourl ? explode(',', $card->videourl) : [];

    // --- 3. Определяем какие надо удалить ------------------------------------
    $imgsToKeep   = $request->input('keep_imgs',   []);
    $audiosToKeep = $request->input('keep_audios', []);
    $videosToKeep = $request->input('keep_videos', []);

    $imgsToDelete   = array_diff($currentImgs,   $imgsToKeep);
    $audiosToDelete = array_diff($currentAudios, $audiosToKeep);
    $videosToDelete = array_diff($currentVideos, $videosToKeep);

    // --- 4. Удаляем ненужные файлы с диска ------------------------------------
    foreach (array_merge($imgsToDelete, $audiosToDelete, $videosToDelete) as $url) {
        $path = public_path(parse_url($url, PHP_URL_PATH));
        if (is_file($path)) {
            @unlink($path);
        }
    }

    $firstUrl = $currentImgs[0] ?? $currentAudios[0] ?? $currentVideos[0] ?? '';
    $firstPath = parse_url($firstUrl, PHP_URL_PATH); // строка
    $folderPath = $firstPath ? dirname($firstPath) : '/file/' . time();

    $destinationPath = public_path($folderPath);
    if (!is_dir($destinationPath)) {
        mkdir($destinationPath, 0777, true);
    }
    $folderName = trim($folderPath, '/');

    // --- 6. Обрабатываем НОВЫЕ файлы -----------------------------------------
    $newImgs   = $imgsToKeep;
    $newAudios = $audiosToKeep;
    $newVideos = $videosToKeep;

    $firstVideoPath = null; // первый оригинальный для превью

    $count = (int) $request->input('count');
    for ($i = 0; $i < $count; $i++) {
        $file = $request->file("files.$i");
        if (!$file || !$file->isValid()) {
            continue;
        }

        $ext  = strtolower($file->getClientOriginalExtension());
        $uid  = uniqid();

        // --- Картинки ---------------------------------------------------------
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif'])) {
            $name = "{$uid}_img.$ext";
            $file->move($destinationPath, $name);
            $newImgs[] = asset("$folderName/$name");
            continue;
        }

        // --- Аудио ------------------------------------------------------------
        if (in_array($ext, ['mp3', 'wav', 'ogg'])) {
            $name = "{$uid}_audio.$ext";
            $file->move($destinationPath, $name);
            $newAudios[] = asset("$folderName/$name");
            continue;
        }

        // --- Видео ------------------------------------------------------------
        if (in_array($ext, ['mp4', 'avi', 'mov'])) {
            $origName     = "{$uid}_original.$ext";
            $origFullPath = $destinationPath . '/' . $origName;
            $file->move($destinationPath, $origName);

            $convName     = "{$uid}_video.webm";
            $convFullPath = $destinationPath . '/' . $convName;

            $thumbPath  = $destinationPath . '/thumbnail.jpg';
            $firstVideoPath ??= $origFullPath;                // сохраняем первый для превью

            // Постановка конвертации в очередь
            \App\Jobs\ConvertVideoToWebM::dispatch(
                $origFullPath,
                $convFullPath,
                $thumbPath,
                $folderName,
                $uid
            );

            $newVideos[] = asset("$folderName/$convName");
            continue;
        }
    }

    // --- 7. Если появилось новое превью — генерируем --------------------------
    if ($firstVideoPath) {
        $thumbPath    = $destinationPath . '/thumbnail.jpg';
        $thumbCommand = sprintf(
            'ffmpeg -i %s -ss 00:00:01.000 -vframes 1 %s',
            escapeshellarg($firstVideoPath),
            escapeshellarg($thumbPath),
        );
        exec($thumbCommand, $o, $code);

        if ($code === 0 && is_file($thumbPath)) {
            $thumbUrl = asset("$folderName/thumbnail.jpg");
            // не дублируем если уже есть
            if (!in_array($thumbUrl, $newImgs)) {
                $newImgs[] = $thumbUrl;
            }
        }
    }

    // --- 8. Сохраняем обновлённые данные --------------------------------------
    $card->update([
        'title'     => $validated['title'],
        'imgurl'    => implode(',', $newImgs),
        'audiourl'  => implode(',', $newAudios),
        'videourl'  => implode(',', $newVideos),
        'status' => 0
    ]);

    return back()->with('success', 'Пост успешно обновлён!');
}
public function deletepost($targetUserId)
    {
        // Поиск поста пользователя
        $post = Card::where('id', $targetUserId)->first();

        if (!$post) {
            return response()->json(['message' => 'Пост не найден'], 404);
        }

        // Удаление поста
        $post->delete();

        return Inertia::location(route('dashboard'));
    }

public function agreepost($targetUserId)
    {
        // Поиск поста пользователя
        $post = Card::where('id', $targetUserId)->first();

        if (!$post) {
            return response()->json(['message' => 'Пост не найден'], 404);
        }

        // Удаление поста
        $post->update([
            'status' => 1
        ]);
        return Inertia::location(route('admin'));
    }

    public function declinepost($targetUserId)
    {
        // Поиск поста пользователя
        $post = Card::where('id', $targetUserId)->first();

        if (!$post) {
            return response()->json(['message' => 'Пост не найден'], 404);
        }

        // Удаление поста
        $post->update([
            'status' => 0
        ]);
        return Inertia::location(route('admin'));
    }
}
