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

class MusicController extends Controller
{
    // Метод для отображения страницы и списка песен
    public function index()
    {
        $songs = Songs::orderBy('created_at', 'desc')->get();
        return Inertia::render('Music', [
            'songs' => $songs,
        ]);
    }
    public function dashboard(Request $request)
    {
        $search = $request->input('search');

        // Основные карточки (новые)
        $cardsQuery = Card::with('user')->orderBy('created_at', 'desc') ;

        if ($search) {
            $cardsQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $cards = $cardsQuery->get();
        $randomCardIds = $cards->pluck('id');

        // Популярные карточки
        $cards2Query = Card::with('user')->withCount('likes')
            ->orderByDesc('likes_count')->take(14);

        if ($search) {
            $cards2Query->where(function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $cards2 = $cards2Query->get();
        $randomCardIds2 = $cards2->pluck('id');

        $user = Auth::user();
        $likedCardIds = [];
        $likedCardIds2 = [];

        if ($user) {
            $likedCardIds = Like::where('user_id', $user->id)
                ->whereIn('card_id', $randomCardIds)
                ->pluck('card_id')
                ->toArray();

            $likedCardIds2 = Like::where('user_id', $user->id)
                ->whereIn('card_id', $randomCardIds2)
                ->pluck('card_id')
                ->toArray();
        }

        $cards->transform(function ($card) use ($likedCardIds) {
            $card->liked = in_array($card->id, $likedCardIds);
            return $card;
        });

        $cards2->transform(function ($card2) use ($likedCardIds2) {
            $card2->liked = in_array($card2->id, $likedCardIds2);
            return $card2;
        });

        return Inertia::render('dashboard', [
            'cards' => $cards,
            'cards2' => $cards2,
            'search' => $search,
        ]);
    }

    public function cardviewer($id)
    {
        $card = Card::with('user')->find($id);

        $comments = $card->comments()
            ->with('user')
            ->latest()
            ->get();

        $user = Auth::user();
        $userId = $user ? $user->id : null;

        $recentCards = Card::where('user_id', $card->user->id)
            ->latest()
            ->take(5)
            ->get();

        $randomCards = Card::with('user')->where('id', '!=', $card->id)
            ->inRandomOrder()
            ->take(56)
            ->get();

        $likedCardIds = [];
        $like = null;
        $subscribe = null;
        if ($userId) {
            $allCardIds = $recentCards->pluck('id')->merge($randomCards->pluck('id'))->unique();

            $likedCardIds = Like::where('user_id', $userId)
                ->whereIn('card_id', $allCardIds)
                ->pluck('card_id')
                ->toArray();

            $like = Like::where('user_id', $userId)
                ->where('card_id', $id)
                ->first();

            $subscribe = Subscriber::where('user_id', $userId)
                ->where('target_user_id', $card->user->id)
                ->first();
        }

        $recentCards->transform(function ($card) use ($likedCardIds) {
            $card->liked = in_array($card->id, $likedCardIds);
            return $card;
        });

        $randomCards->transform(function ($card) use ($likedCardIds) {
            $card->liked = in_array($card->id, $likedCardIds);
            return $card;
        });

        $count = Like::where('card_id', operator: $id)->count();
        $count2 = Subscriber::where('target_user_id', $card->user->id)->count();
        return Inertia::render('CardPage', [
            'card' => $card,
            'recentCards' => $recentCards,
            'comments' => $comments,
            'randomCards' => $randomCards,
            'count' => $count,
            'like' => $like,
            'subscriber' => $subscribe,
            'subscribercount' => $count2
        ]);
    }


    public function profileviewer($id)
    {
        $card = Card::with('user')->findOrFail($id);

        $user = Auth::user();
        $userId = $user ? $user->id : null;

        $recentCards = Card::where('user_id', $id)->with('user')->get();

        // Получаем id карточек из recentCards и randomCards
        $recentCardIds = $recentCards->pluck('id');
        // Получаем лайки пользователя по всем этим карточкам
        $likedCardIds = $userId
            ? Like::where('user_id', $userId)
            ->whereIn('card_id', $recentCardIds)
            ->pluck('card_id')
            ->toArray()
            : [];

        // Добавляем liked к recentCards
        $recentCards->transform(function ($card) use ($likedCardIds) {
            $card->liked = in_array($card->id, $likedCardIds);
            return $card;
        });
        $subscribe = Subscriber::where('user_id', $userId)
            ->where('target_user_id', $card->user->id)
            ->first();
        $count2 = Subscriber::where('target_user_id', $card->user->id)->count();
        return Inertia::render('Profile', [
            'recentCards' => $recentCards,
            'subscriber' => $subscribe,
            'subscribercount' => $count2
        ]);
    }
    // Метод для загрузки новой песни
    public function store(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'title' => 'required|string',
        ]);

        // Get the uploaded file
        $file = $request->file('audio');

        if ($file && $file->isValid()) {
            // Define the path where you want to save the file in the public folder
            $destinationPath = public_path('music');
            $fileName = time() . '.' . $file->getClientOriginalExtension(); // Unique file name

            // Move the uploaded file to the public/music directory
            $file->move($destinationPath, $fileName);

            // Get the public URL for the stored file
            $url = asset('music/' . $fileName);

            // Store the song details in the database
            Songs::create([
                'title' => $request->input('title'),
                'user_id' => Auth::user(),
                'url' => $url,
            ]);

            return Inertia::location(route('music'));
        } else {
            return response()->json(['message' => 'Ошибка при загрузке файла.'], 400);
        }
    }
   public function dashstore(Request $request)
{
    $count = (int) $request->input('count');

    // Папка вида public/file/1686900000
    $timestamp       = time();
    $folderName      = "file/{$timestamp}";
    $destinationPath = public_path($folderName);

    if (!is_dir($destinationPath)) {
        mkdir($destinationPath, 0o777, true);
    }

    $imgUrls   = [];
    $audioUrls = [];
    $videoUrls = [];

    $firstVideoPath = null;

    for ($i = 0; $i < $count; $i++) {
        $file = $request->file("files.$i");

        if ($file && $file->isValid()) {
            $fileExtension = strtolower($file->getClientOriginalExtension());
            $fileId        = uniqid();

            /* ---------- ИЗОБРАЖЕНИЯ ---------- */
            if (in_array($fileExtension, ['jpg', 'jpeg', 'png'])) {

                /** 1. Кладём оригинал во временное имя (чтобы можно было удалить). */
                $originalName     = "{$fileId}_src.{$fileExtension}";
                $originalFullPath = $destinationPath . '/' . $originalName;
                $file->move($destinationPath, $originalName);

                /** 2. Имя итогового WebP‑файла. */
                $webpName     = "{$fileId}_img.webp";
                $webpFullPath = $destinationPath . '/' . $webpName;

                /** 3. Конвертируем (libwebp, качество 75). */
                $cmd = sprintf(
                    'ffmpeg -i %s -c:v libwebp -qscale 75 -lossless 0 -y %s',
                    escapeshellarg($originalFullPath),
                    escapeshellarg($webpFullPath)
                );
                exec($cmd, $ffOut, $ffExit);

                if ($ffExit === 0 && file_exists($webpFullPath)) {
                    $imgUrls[] = asset($folderName . '/' . $webpName);
                    // При желании можно удалить оригинал:
                    @unlink($originalFullPath);
                } else {
                    // Если что‑то пошло не так, сохраняем оригинал
                    $imgUrls[] = asset($folderName . '/' . $originalName);
                }

            /* ---------- АУДИО ---------- */
            }
            elseif (in_array($fileExtension, ['gif'])) {
                    $fileName = "{$fileId}_img." . $fileExtension;
                    $file->move($destinationPath, $fileName);
                    $imgUrls[] = asset($folderName . '/' . $fileName);

            /* ---------- АУДИО ---------- */
            }
            elseif (in_array($fileExtension, ['mp3', 'wav', 'ogg'])) {
                $fileName = "{$fileId}_audio.{$fileExtension}";
                $file->move($destinationPath, $fileName);
                $audioUrls[] = asset($folderName . '/' . $fileName);

            /* ---------- ВИДЕО ---------- */
            } elseif (in_array($fileExtension, ['mp4', 'avi', 'mov'])) {
                $fileName          = "{$fileId}_original.{$fileExtension}";
                $originalFullPath  = $destinationPath . '/' . $fileName;
                $file->move($destinationPath, $fileName);

                $convertedName     = "{$fileId}_video.webm";
                $convertedFullPath = $destinationPath . '/' . $convertedName;
                $thumbnailPath     = $destinationPath . '/thumbnail.jpg';
                $firstVideoPath    = $originalFullPath;

                /* превью одного кадра */
                $cmdThumb = sprintf(
                    'ffmpeg -i %s -ss 00:00:01 -vframes 1 -y %s',
                    escapeshellarg($firstVideoPath),
                    escapeshellarg($thumbnailPath)
                );
                exec($cmdThumb);

                if (file_exists($thumbnailPath)) {
                    $imgUrls[] = asset($folderName . '/thumbnail.jpg');
                }

                /* конвертируем видео асинхронно */
                \App\Jobs\ConvertVideoToWebM::dispatch(
                    $originalFullPath,
                    $convertedFullPath,
                    $thumbnailPath,
                    $folderName,
                    $fileId
                );

                $videoUrls[] = asset($folderName . '/' . $convertedName); // ожидаемый URL
            }
        }
    }

    /* ---------- СОХРАНЯЕМ КАРТОЧКУ ---------- */
    Card::create([
        'title'     => $request->input('title'),
        'user_id'   => Auth::id(),
        'imgurl'    => implode(',', $imgUrls),
        'videourl'  => implode(',', $videoUrls),
        'audiourl'  => implode(',', $audioUrls),
        'status'    => 0,
    ]);

    return Inertia::location(route('dashboard'));
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

                $convName     = "{$uid}_video";
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
    public function toggleLike($cardId)
    {
        $user = Auth::user();

        $like = Like::where('user_id', $user->id)->where('card_id', $cardId)->first();

        if ($like) {
            $like->delete();
            return redirect()->back();
        } else {
            Like::create([
                'user_id' => $user->id,
                'card_id' => $cardId,
            ]);
            return redirect()->back();
        }
    }


    public function toggleLike2(Request $request, int $cardId)
    {
        $user = $request->user();
        $card = Card::findOrFail($cardId);

        // проверяем, есть ли лайк
        $like = $card->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $card->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return response()->json([
            'liked'       => $liked,
            'likesCount'  => $card->likes()->count(),
        ]);
    }
    public function toggleSubscription($targetUserId)
    {

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Пользователь не аутентифицирован.'], 401);
        }
        if ($user->id == $targetUserId) {
            return response()->json(['error' => 'Нельзя подписаться на самого себя.'], 400);
        }

        $subscription = Subscriber::where('user_id', $user->id)
            ->where('target_user_id', $targetUserId)
            ->first();

        if ($subscription) {
            $subscription->delete();
            return redirect()->back();
        } else {
            Subscriber::create([
                'user_id' => $user->id,
                'target_user_id' => $targetUserId,
            ]);
            return redirect()->back();
        }
    }
}
