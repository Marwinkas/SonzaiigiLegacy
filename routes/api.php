<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\PostController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/users', [ApiController::class, 'index']);
    Route::post('registermobile', [RegisteredUserController::class, 'register']);

    Route::post('loginmobile', [AuthenticatedSessionController::class, 'login']);



Route::get('/posts', [PostController::class, 'index']);
Route::middleware('auth:sanctum')->get('/friends', [PostController::class, 'friends']);

Route::middleware('auth:sanctum')->get('message/{id}', [PostController::class, 'Message']);
Route::middleware('auth:sanctum')->post('message/{id}', [PostController::class, 'store']);


Route::middleware('auth:sanctum')->get('profilemobile', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'name' => $user->name,
        'email' => $user->email,
        'avatar' => $user->photo,
    ]);
});
