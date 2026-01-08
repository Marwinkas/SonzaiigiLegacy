<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
    
        // Валидация (можно вынести в FormRequest при желании)
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'photo' => ['nullable', 'image', 'max:2048'], // до 2MB
        ]);
    
        // Обновляем базовые поля
        $user->name = $request->input('name');
        $user->email = $request->input('email');
    
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
    
            if (!$photo->isValid()) {
                return back()->withErrors(['photo' => 'Файл не валиден.']);
            }
    
            // Создаем уникальное имя файла
            $filename = uniqid('user_') . '.' . $photo->getClientOriginalExtension();
    
            // Путь до public/img
            $destination = public_path('img');
    
            // Перемещаем файл в public/img
            $photo->move($destination, $filename);
    
            // Сохраняем путь в БД (относительно public/)
            $user->photo = 'img/' . $filename;
        }
    
        try {
            $user->save();
        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    
        return to_route('profile.edit');
    }
    
    
    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
