<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Songs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
class ImageController extends Controller
{
    // Метод для отображения страницы и списка песен
    public function index()
    {
        $video = Image::orderBy('created_at', 'desc')->get();
        return Inertia::render('Image', [
            'videos' => $video,
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
        $file = $request->file('image');
        
        if ($file && $file->isValid()) {
            // Define the path where you want to save the file in the public folder
            $destinationPath = public_path('image');
            $fileName = time() . '.' . $file->getClientOriginalExtension(); // Unique file name
            
            // Move the uploaded file to the public/music directory
            $file->move($destinationPath, $fileName);
        
            // Get the public URL for the stored file
            $url = asset('image/' . $fileName);
        
            // Store the song details in the database
            Image::create([
                'title' => $request->input('title'),
                'author' => Auth::user()->name,
                'url' => $url,
            ]);
        
            return Inertia::location(route('image'));
        } else {
            return response()->json(['message' => 'Ошибка при загрузке файла.'], 400);
        }
    }
}