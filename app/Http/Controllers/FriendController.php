<?php

// app/Http/Controllers/FriendController.php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FriendController extends Controller
{

public function index(Request $request)
{
    $user   = $request->user();
    $search = trim($request->input('search', ''));

    // 1. Уже принятые друзья
    $friends = $user->friends()
        ->when($search, fn ($q) => $q->where('name', 'LIKE', "%{$search}%"))
        ->get();

    // 2. Входящие заявки
    $incomingRequests = $user->friendRequests()
        ->with('user')
        ->when($search, fn ($q) => $q->whereHas(
            'user',
            fn ($q2) => $q2->where('name', 'LIKE', "%{$search}%")
        ))
        ->get();
    $incomingIds = $incomingRequests->pluck('user_id');

    // 3. Наши исходящие (pending)
    $outgoingRequests = Friendship::where('user_id', $user->id)
        ->where('status', 'pending')
        ->with(['friend', 'user'])
        ->when($search, fn ($q) => $q->whereHas(
            'friend',
            fn ($q2) => $q2->where('name', 'LIKE', "%{$search}%")
        ))
        ->get();
    $outgoingIds = $outgoingRequests->pluck('friend_id');

    // 4. ID‑шники, которые исключаем
    $excludedIds = collect([$user->id])
        ->merge($friends->pluck('id'))
        ->merge($incomingIds)
        ->merge($outgoingIds)
        ->unique();

    // 5. «Другие пользователи» (кому можно кинуть заявку)
    $otherUsers = User::whereNotIn('id', $excludedIds)
        ->when($search, fn ($q) => $q->where('name', 'LIKE', "%{$search}%"))
        ->get();

    // 6. Отдаём во фронт
    return Inertia::render('Friends', [
        'friends'        => $friends,
        'requests'       => $incomingRequests,
        'sentRequests'   => $outgoingRequests,
        'otherUsers'     => $otherUsers,
        // важно — чтобы компонент знал текущее значение поиска
        'filters'        => [
            'search' => $search,
        ],
    ]);
}


    public function sendRequest($friendId)
    {
        $user = Auth::user();

        if ($user->id == $friendId) {
            return back()->withErrors(['friend_id' => 'Нельзя добавить себя.']);
        }

        Friendship::firstOrCreate([
            'user_id' => $user->id,
            'friend_id' => $friendId,
        ]);

        return redirect()->back();
    }

    public function acceptRequest($id)
    {
        $request = Friendship::where('id', $id)
            ->where('friend_id', Auth::id())
            ->firstOrFail();

        $request->update(['status' => 'accepted']);

        // Создать обратную связь (в обе стороны)
        Friendship::firstOrCreate([
            'user_id' => Auth::id(),
            'friend_id' => $request->user_id,
        ], [
            'status' => 'accepted',
        ]);

        return redirect()->back();
    }

    public function declineRequest($id)
    {
        $request = Friendship::where('id', $id)
            ->where('friend_id', Auth::id())
            ->firstOrFail();

        $request->update(['status' => 'declined']);

        return redirect()->back();
    }
}
