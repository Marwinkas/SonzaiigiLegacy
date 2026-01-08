<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Models\Songs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
class VideoController extends Controller
{
    // Метод для отображения страницы и списка песен
    public function index()
    {
        $videos = Video::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Video', [
            'videos' => $videos,
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
        $file = $request->file('video');
        
        if ($file && $file->isValid()) {
            // Define the path where you want to save the file in the public folder
            $destinationPath = public_path('video');
            $fileName = time() . '.' . $file->getClientOriginalExtension(); // Unique file name
            
            // Move the uploaded file to the public/music directory
            $file->move($destinationPath, $fileName);
        
            // Get the public URL for the stored file
            $url = asset('video/' . $fileName);
        
            // Store the song details in the database
            Video::create([
                'title' => $request->input('title'),
                'user_id' => Auth::user(),
                'url' => $url,
            ]);
        
            return Inertia::location(route('video'));
        } else {
            return response()->json(['message' => 'Ошибка при загрузке файла.'], 400);
        }
    }
}