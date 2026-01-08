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
use Illuminate\Http\JsonResponse;
class ApiController extends Controller
{
    // Метод для отображения страницы и списка песен
    public function index(): JsonResponse
{
    return response()->json(data: Card::all());
}
    public function post($id): JsonResponse
{
    $card = Card::findOrFail($id);
    return response()->json(data: $card);
}
}
