<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function store(Request $request)
    {

        Comment::create([
            'user_id' => Auth::id(),
            'card_id' => $request->card_id,
            'body' => $request->body,
        ]);

        return redirect()->back()->with('success', 'Комментарий добавлен!');
    }
}
