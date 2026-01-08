import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Typography,
  Textarea,
  Sheet,
  CssVarsProvider,
  extendTheme,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
} from "@mui/joy";
import AppLayout from "@/layouts/app-layout";
import { type SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInitials } from "@/hooks/use-initials";

// Пользовательские данные и типы (пример)
import { ChatProps } from "../types";
import { chats } from "../data";
import DOMPurify from "dompurify";
/**
 * Axios global configuration (optional)
 * Ensures CSRF + AJAX headers are always set.
 */
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        neutral: {
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
      },
    },
  },
});

const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

const MyProfile = ({ users, messages, id }) => {
  const [receiverId, setReceiverId] = useState(id);
  const [content, setContent] = useState("");
  const [selectedSenderId, setSelectedSenderId] = useState("");
  const [selectedSenderId2, setSelectedSenderId2] = useState(id);
  const [selectedChat, setSelectedChat] = useState(chats[0]);

  const { auth } = usePage<SharedData>().props;
  const getInitials = useInitials();

  /**
   * Все сообщения в активном чате держим в стейте
   */
  const [chatMessages, setChatMessages] = useState(messages);

  /**
   * Форматирование даты на русском
   */
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  /**
   * Фильтрация сообщений по текущему собеседнику (если нужно показать только один диалог).
   */
  const filteredMessages = selectedSenderId
    ? chatMessages?.filter(
        (message) =>
          message.sender?.name === selectedSenderId ||
          message.receiver?.name === selectedSenderId
      )
    : chatMessages;

  /**
   * Обновление списка сообщений без перезагрузки страницы.
   * Каждые 1.5 секунд летим на backend за JSON и обновляем state.
   */
  useEffect(() => {
    if (!id || id === 1) return; // 1 — «выберите чат»

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/messages/${id}`, {
          params: { ajax: true }, // можете использовать любой флаг, чтобы backend вернул JSON
        });
        setChatMessages(data.messages);
      } catch (err) {
        console.error("Не удалось получить сообщения:", err);
      }
    };

    fetchMessages(); // загрузка при монтировании

    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, [id]);

  /**
   * Отправка сообщения через axios.post
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/message/${id}`, {
        receiver_id: receiverId,
        content,
      });

      /**
       * Предполагаем, что backend возвращает созданное сообщение в ответе.
       * Добавляем его к текущему стейту, чтобы почувствовать мгновенный отклик.
       */
      if (data?.message) {
        setChatMessages((prev) => [...prev, data.message]);
      } else {
        // запасной вариант: сразу запрашиваем сервер, если в ответе нет сообщения
        setChatMessages((prev) => [...prev]);
      }
      setContent("");
    } catch (err) {
      console.error("Не удалось отправить сообщение:", err);
    }
  };

  return (
    <CssVarsProvider theme={theme}>
      <AppLayout breadcrumbs={breadcrumbs}>


        <Sheet
          sx={{
            mx: "auto",
            p: 2,
            borderRadius: "lg",
            boxShadow: "lg",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
            width: "100%",
            height: "100%",
            gap: 2,
            bgcolor: "black",
          }}
        >
          {/* ==== СПИСОК ДИАЛОГОВ ==== */}
          <Sheet
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 2,
              borderRadius: "md",
              boxShadow: "sm",
              bgcolor: "#2b2b2b",
            }}
          >
            <Typography level="h5" sx={{ color: "white", mb: 1 }}>
              Диалоги
            </Typography>
            <List
              sx={{
                bgcolor: "#2b2b2b",
                borderRadius: "sm",
                overflow: "auto",
                maxHeight: 920,
                px: 0,
              }}
            >
              {users.map((user) => (
                <a key={user.id} href={`http://sonzaiigi.art/message/${user.id}`}>
                  <ListItem>
                    <ListItemButton
                      selected={selectedSenderId2 === user.id}
                      onClick={() => setSelectedSenderId2(user.id)}
                      sx={{
                        borderRadius: "md",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#4a4a4a",
                        },
                        "&.Mui-selected": {
                          bgcolor: "#5c5c5c",
                          "&:hover": { bgcolor: "#4a4a4a" },
                        },
                      }}
                    >
                      <Avatar className="h-11 w-11 overflow-hidden rounded-full  mr-2.5 mt-2">
                        <AvatarImage src={`http://sonzaiigi.art/${user.photo}`} />
                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <ListItemContent>
                        <Typography sx={{ color: "white" }}>{user.name}</Typography>
                      </ListItemContent>
                    </ListItemButton>
                  </ListItem>
                </a>
              ))}
            </List>
          </Sheet>

          {/* ==== ОСНОВНАЯ ПАНЕЛЬ ==== */}
          {id != 1 ? (
            <Sheet
              sx={{
                display: "flex",
                flexDirection: "column",
                bgcolor: "#1e1e1e",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              {/* ==== СООБЩЕНИЯ ==== */}
              <Sheet
                sx={{
                  p: 2,
                  borderRadius: "md",
                  boxShadow: "sm",
                  bgcolor: "#1e1e1e",
                  overflowY: "auto",
                  maxHeight: 870,
                }}
              >
                <Typography level="h5" sx={{ color: "white", mb: 2 }}>
                  Переписка
                </Typography>
                {filteredMessages && filteredMessages.length > 0 ? (
                  filteredMessages.map((message, index) => {
                    const isMe = message.sender?.id === auth.user.id;
                    return (
                      <Sheet
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          bgcolor: "#1e1e1e",
                          mb: 1,
                        }}
                      >
                        <Card
                          sx={{
                            maxWidth: "70%",
                            p: 1.5,
                            bgcolor: isMe ? "primary.500" : "neutral.200",
                            color: isMe ? "white" : "black",
                            borderRadius: "lg",
                            boxShadow: "xs",
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ mb: 0.5, color: isMe ? "white" : "black" }}
                          >
                            {isMe ? "Вы" : message.sender?.name || "Неизвестно"}
                          </Typography>
                            <Typography
                            component="div"
                            sx={{ color: isMe ? "white" : "black" }}
                            >
                            <span
                            dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(message.content, {
                                ADD_TAGS: ["style","iframe"],
                                ADD_ATTR: ["class",]
                            })
                            }}
                            />
                            </Typography>
                          <Typography
                            level="body-xs"
                            sx={{
                              mt: 0.5,
                              textAlign: "right",
                              opacity: 0.7,
                              color: isMe ? "white" : "black",
                            }}
                          >
                            {formatDate(message.created_at)}
                          </Typography>
                        </Card>
                      </Sheet>
                    );
                  })
                ) : (
                  <Typography sx={{ color: "primary.500" }}>
                    Сообщений не найдено
                  </Typography>
                )}
              </Sheet>

              {/* ==== ОТПРАВКА ==== */}
              <Sheet
                sx={{
                  p: 2,
                  borderRadius: "md",
                  boxShadow: "sm",
                  bgcolor: "#1e1e1e",
                }}
              >
                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", gap: "0.5rem" }}
                >
                  <Textarea
                    minRows={2}
                    placeholder="Введите сообщение..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    sx={{
                      flexGrow: 1,
                      bgcolor: "#2e2e2e",
                      color: "white",
                      borderColor: "#1e1e1e",
                      "&:focus-within": { borderColor: "#1e1e1e" },
                    }}
                  />
                  <Button
                    type="submit"
                    color="primary"
                    sx={{
                      px: 3,
                      bgcolor: "#000000",
                      "&:hover": { bgcolor: "#1e1e1e" },
                    }}
                  >
                    ➤
                  </Button>
                </form>
              </Sheet>
            </Sheet>
          ) : (
            <div className="m-auto text-white text-5xl">
              <p>Выберите чат</p>
            </div>
          )}
        </Sheet>
      </AppLayout>
    </CssVarsProvider>
  );
};

export default MyProfile;
