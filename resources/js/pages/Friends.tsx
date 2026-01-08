import React from 'react';
import { useForm } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePage } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import {  router } from '@inertiajs/react';
import { useEffect } from 'react';
import debounce from 'lodash.debounce';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Главная',
        href: '/settings/profile',
    },
];
interface User {
  id: number;
  name: string;
  email: string;
}

interface FriendRequest {
  id: number;
  user: User;
}

interface FriendsIndexProps {
  friends: User[];
  requests: FriendRequest[];
  sentRequests: User[];
  otherUsers: User[];
}

export default function FriendsIndex({ friends, requests,sentRequests, otherUsers,filters  }: FriendsIndexProps) {

  const { data, setData, processing, post } = useForm({ search: filters.search || '', friend_id: '' });

  const sendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.friend_id) {
      post(`/friends/send/${data.friend_id}`);
    }
  };

  const acceptRequest = (id: number) => {
    post(`/friends/accept/${id}`);
  };

  const declineRequest = (id: number) => {
    post(`/friends/decline/${id}`);
  };
  const getInitials = useInitials();


  // Дебаунсим запрос, чтобы не дергать сервер на каждый символ
  const debouncedSearch = debounce((value) => {
    router.get(route('friends.index'), { search: value }, {
      preserveState : true,   // сохраняем прокрученный список
      replace       : true,   // не засоряем history
    });
  }, 400);

  // Следим за изменениями поля поиска
  useEffect(() => {
    debouncedSearch(data.search);
    return debouncedSearch.cancel;
  }, [data.search]);


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="w-full mx-auto p-6 space-y-12">
        <h1 className="text-3xl font-extrabold text-center text-white">Мои друзья</h1>


          {/* Заявки */}
          <div className="w-full">
          <h2 className="text-2xl font-bold text-whhte mb-4">Заявки в друзья</h2>
          <div className="space-y-4 w-full">
            {requests.length > 0 ? (
              requests.map(({ id, user }) => (
                <div
                  key={id}
                  className="bg-gray-800 border rounded-2xl shadow-lg p-6 flex items-center justify-between hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 overflow-hidden rounded-full  mr-2.5 mt-2">
                    <AvatarImage src={"http://sonzaiigi.art/" + user.photo} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(id)}
                      disabled={processing}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl flex items-center gap-1"
                    >
                      <UserCheck size={16} />
                      Принять
                    </button>
                    <button
                      onClick={() => declineRequest(id)}
                      disabled={processing}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl flex items-center gap-1"
                    >
                      <UserX size={16} />
                      Отклонить
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white">Нет новых заявок.</p>
            )}
          </div>
        </div>



        {/* Друзья */}
        <h2 className="text-2xl font-bold text-whhte mb-4">Мои друзья</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-gray-800  border rounded-2xl shadow-lg p-6 flex items-center gap-4"
              >

                  <Avatar className="h-11 w-11 overflow-hidden rounded-full  mr-2.5 mt-2">
                    <AvatarImage src={"http://sonzaiigi.art/" + friend.photo} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(friend.name)}
                    </AvatarFallback>
                  </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-white">{friend.name}</h3>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">У вас нету друзей</p>
          )}
        </div>
     <input
        type="search"
        value={data.search}
        onChange={(e) => setData('search', e.target.value)}
        placeholder="Поиск по имени..."
        className="w-full rounded-xl border px-4 py-3"
      />
{/* Добавить друга */}
<div>
  <h2 className="text-2xl font-bold text-white mb-4">Добавить в друзья</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {otherUsers.length > 0 ? (
      otherUsers.map((user) => (
        <div
          key={user.id}
          className="bg-gray-800 border rounded-2xl shadow-lg p-6 flex flex-col items-center justify-between hover:shadow-2xl transition-all"
        >
          <div className="flex items-center gap-4 flex-col">
            <Avatar className="h-11 w-11 overflow-hidden rounded-full mr-2.5 mt-2">
              <AvatarImage src={"http://sonzaiigi.art/" + user.photo} />
              <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{user.name}</h3>
            </div>
          </div>
          <button
            onClick={() => {
              setData('friend_id', String(user.id));
              post(`/friends/send/${user.id}`);
            }}
            disabled={processing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-1"
          >
            <UserPlus size={16} />
            Добавить
          </button>
        </div>
      ))
    ) : (
      <p className="text-white">Нет доступных пользователей для добавления.</p>
    )}
  </div>
</div>
      </div>
    </AppLayout>
  );
}
