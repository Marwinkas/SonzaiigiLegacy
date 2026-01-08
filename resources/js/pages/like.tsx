import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

interface Props {
  postId: number;
  initialLiked: boolean; // Начальное состояние лайка (из базы данных)
}

const LikeButton: React.FC<Props> = ({ postId, initialLiked }) => {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);

    Inertia.post(`/api/like/${postId}`, {
      method: 'POST',
      data: { liked: !liked } // Отправляем новое состояние лайка на сервер
    }, {
      onSuccess: (response) => {
        // Обработка успешного ответа с сервера, если нужно.
        console.log('Like toggled successfully:', response);
      }
    });
  };

  return (
    <div>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-500 focus:ring-blue-300 border-gray-300"
          checked={liked}
          onChange={toggleLike}
        />
        <span className="ml-2">Лайк</span>
      </label>
    </div>
  );
};

export default LikeButton;
