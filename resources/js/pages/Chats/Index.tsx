    import React, { useState, useEffect, useRef } from "react";
    import { Inertia } from "@inertiajs/inertia";
    import axios from "axios";
    import DOMPurify from "dompurify";
    import {
    Card,
    Typography,
    Input,
    Button,
    Box,
    Sheet,
    Modal,
    Alert,
    Avatar,
    CssVarsProvider,
    extendTheme, IconButton, ModalDialog, List, ListItem
    }
    from "@mui/joy";
    import MenuIcon from '@mui/icons-material/Menu';
    import Textarea from '@mui/joy/Textarea';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { motion } from "framer-motion";
    import SettingsIcon from "@mui/icons-material/Settings";
    import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from '@mui/icons-material/Save';
import LinkIcon from '@mui/icons-material/Link';
    import AppLayout from "@/layouts/app-layout";
    import DeleteIcon from "@mui/icons-material/Delete";
    import { type SharedData } from "@/types";
    import { usePage } from "@inertiajs/react";
    import { useInitials } from "@/hooks/use-initials";

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
    // Пользовательские данные и типы (пример)
    import { ChatProps } from "../types";
    import { chats } from "../data";
import HtmlEditor from "./HtmlEditor";
    /**
     * Axios global configuration (optional)
     * Ensures CSRF + AJAX headers are always set.
     */
    axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

    const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

    type User = { id: number; name: string };
    type Message = { id: number; body: string; created_at: string; user: User };
    type Chat = { id: number; name: string; messages: Message[]; users: User[]; image?: string };
    type Auth = { user: User };
    type ChatsProps = { chats: Chat[]; auth: Auth; users: User[] };

    export default function Chats({ chats, auth,users }: ChatsProps) {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [message, setMessage] = useState("");
    const [newChatName, setNewChatName] = useState("");
    const [newChatDesc, setNewChatDesc] = useState("");
    const [userIds, setUserIds] = useState("");
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [chatImage, setChatImage] = useState<File | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
const [showUsers, setShowUsers] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const chatImageInputRef = useRef<HTMLInputElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
const handleLeaveChat = async (chatId) => {
  try {
    await axios.post(`/chats/${chatId}/leave`);
    // Можно обновить список чатов или закрыть модалку
    setChatInfoModalOpen(false);
    // обновить список чатов, если нужно
  } catch (error) {
    console.error(error);
  }
};
    const [createChatModalOpen, setCreateChatModalOpen] = useState(false); // модалка слева
    const [chatInfoModalOpen, setChatInfoModalOpen] = useState(false);
     const [settingsOpen, setSettingsOpen] = useState(false);
     const [addingMode, setAddingMode] = useState(false);











  const [blocks, setBlocks] = useState([]); // массив объектов {type: "text"|"img", content: string}
  const [input, setInput] = useState("");

  const parseInput = (text) => {
    const regex = /(@img="(https?:\/\/[^\s]+)")/g;
    let lastIndex = 0;
    const result = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      result.push({ type: "img", content: match[2] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({ type: "text", content: text.slice(lastIndex) });
    }

    return result;
  };

  const handleChange = (e) => {
    const text = e.target.value;
    const parsedBlocks = parseInput(text);
    setBlocks(parsedBlocks);
    setInput(""); // очищаем поле, чтобы вставить новый блок
  };

  const removeBlock = (index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };



useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
        try {
            const { data } = await axios.get(`/chats/${selectedChat.id}/messages`);

            setSelectedChat((prev) => {
                if (!prev) return prev;

                // Если количество сообщений не изменилось, не обновляем state
                if (prev.messages.length === data.messages.length) {
                    return prev;
                }

                return { ...prev, messages: data.messages };
            });
        } catch (error) {
            console.error(error);
        }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
}, [selectedChat?.id]);


const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
        await axios.post(`/chats/${selectedChat.id}/messages`, {
            body: message,
        });

        // Очистка поля после успешной отправки
        setMessage("");
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        // Здесь можно добавить уведомление для пользователя
    }
};
const handleSaveChatInfo = async (file) => {
  const formData = new FormData();
  formData.append("name", selectedChat.name);
  formData.append("description", selectedChat.description);
  if (file) formData.append("avatar", file);

  try {
    const response = await axios.post(`/chats/${selectedChat.id}/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // обязательно для FormData
      },
    });
    console.log("Информация о чате успешно сохранена!", response.data);
    setAvatarFile(null);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(error.response.data); // вывод ошибок с сервера
    } else {
      console.error(error.message); // другие ошибки
    }
  }
};
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !selectedChat) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
        const { data } = await axios.post(`/chats/${selectedChat.id}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setUploadedFileUrl(data.url);
        } catch (err) { console.error(err); }
    };

    const handleChatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) setChatImage(e.target.files[0]);
    };

const [avatarFile, setAvatarFile] = useState(null);
const [hoveringAvatar, setHoveringAvatar] = useState(false);
    const createChat = async () => {
    if (!newChatName.trim()) return;
    const ids = userIds.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    const formData = new FormData();
    formData.append("name", newChatName);
    formData.append("description", newChatDesc);
    // Добавляем массив правильно
    ids.forEach(id => formData.append("user_ids[]", id.toString()));

    if (chatImage) formData.append("image", chatImage);

    try {
        await axios.post("/chats", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setModalOpen(false);
        setNewChatName("");
        setUserIds("");
        setChatImage(null);
    } catch (err) { console.error(err); }
    };

    const renderMessageContent = (msg: Message) => (
        <div
        dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(msg.body, {
            ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'br', 'img', 'div', 'span', 'style'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'target', 'rel'],
            }),
        }}
        />
    );

            const renderStringContent = (msg: String) => (
            <div
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(msg, {
                ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'br', 'img', 'div', 'span', 'style'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'target', 'rel'],
                }),
            }}
            />
        );
  const [newUserId, setNewUserId] = useState("");

const handleAddUser = async (userId) => {
  if (!userId) return;

  try {
    await axios.post(`/chats/${selectedChat.id}/add-user`, {
      user_id: userId,
    });

    alert("Пользователь добавлен!");
  } catch (err) {
    console.error(err);
    alert("Ошибка при добавлении пользователя");
  }
};














    const handleNavigate = (url: string) => {
        Inertia.visit(url);
        setMenuOpen(false); // закрываем меню при переходе
    };
const [menuOpen, setMenuOpen] = useState(false); // состояние выдвижения меню


    return (

        <>
        <HtmlEditor/>
        <CssVarsProvider theme={theme}>

        <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
            {/* Overlay для закрытия меню при клике вне */}
            {menuOpen && (
                <Box
                    onClick={() => setMenuOpen(false)}
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        zIndex: 5,
                    }}
                />
            )}

            {/* Выдвигающееся меню */}
<Sheet
    variant="outlined"
    sx={{
        position: "fixed",
        top: 0,
        left: menuOpen ? 0 : "-220px", // чуть шире для плавного появления
        width: 220,
        height: "100%",
        bgcolor: "linear-gradient(145deg, #fef9ff, #f0e0ff)", // фон как у модалки
        border: "1px solid rgba(255,255,255,0.2)", // рамка как у модалки
        boxShadow: "0 20px 40px rgba(100,50,200,0.3)",
        transition: "left 0.3s ease",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        p: 2,
    }}
>
    <List>
        <ListItem
            onClick={() => Inertia.visit("/")}
            sx={{
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                color: "#4b1f8a",
                "&:hover": { bgcolor: "rgba(200,150,255,0.1)" },
            }}
        >
            Главная
        </ListItem>
        <ListItem
            onClick={() => Inertia.visit("/chats")}
            sx={{
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                color: "#4b1f8a",
                "&:hover": { bgcolor: "rgba(200,150,255,0.1)" },
            }}
        >
            Мессенджер
        </ListItem>
        <ListItem
            onClick={() => Inertia.visit("/friends")}
            sx={{
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                color: "#4b1f8a",
                "&:hover": { bgcolor: "rgba(200,150,255,0.1)" },
            }}
        >
            Друзья
        </ListItem>
    </List>
</Sheet>

            {/* Сайдбар с кнопкой гамбургер */}
                <Sheet
                    variant="outlined"
                    sx={{
                        width: "60px",
                        borderRight: "1px solid #ccc",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 1, // было 1
                    }}
                >
                <IconButton onClick={() => setMenuOpen(!menuOpen)} sx={{ mb: 2, mt: 1 }}>
                    <MenuIcon />
                </IconButton>

                <Button
                    variant="solid"
                    color="primary"
                    onClick={() => setCreateChatModalOpen(true)}
                    sx={{ width: 50, height: 50, minWidth: 0, borderRadius: 1, p: 0 }}
                >
                    +
                </Button>

                {chats.map(chat => (
                    <Box
                        key={chat.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: 1,
                            cursor: "pointer",
                            backgroundColor: selectedChat?.id === chat.id ? "#f0f0f0" : "transparent",
                            justifyContent: "center",
                        }}
                        onClick={() => setSelectedChat(chat)}
                        title={chat.name}
                    >
                        <Avatar src={chat.image} sx={{ width: 40, height: 40 }}>
                            {!chat.image && chat.name[0].toUpperCase()}
                        </Avatar>
                    </Box>
                ))}
            </Sheet>


        {/* Чат */}
        <Box sx={{ display: "flex", flexDirection: "column",width:"calc(100% - 60px)"  }}>

            {selectedChat ? (
            <>
                <Sheet
                variant="outlined"
                sx={{ p: 2, borderBottom: "1px solid #ccc", cursor: "pointer"}}
                onClick={() => setChatInfoModalOpen(true)}
                >
                <Typography level="h5">{renderStringContent(selectedChat.name)}</Typography>
                <Typography level="body-sm" textColor="text.tertiary">
                    Участники: {selectedChat.users.map(u => u.name).join(", ")}
                </Typography>
                </Sheet>

                <Box sx={{ flex: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                {selectedChat.messages.map(msg => (
                    <Card
                    key={msg.id}
                    variant={msg.user.id === auth.user.id ? "soft" : "outlined"}
                    color={msg.user.id === auth.user.id ? "primary" : "neutral"}
                    sx={{ width: "100%", mb: 1, wordBreak: "break-word" }}
                    >
                    <Typography level="body-sm" sx={{ fontWeight: "bold" }}>
                        {msg.user.name}{" "}
                        <Typography level="body-xs" textColor="text.tertiary">
                        [{new Date(msg.created_at).toLocaleTimeString()}]
                        </Typography>
                    </Typography>
                    {renderMessageContent(msg)}
                    </Card>
                ))}
                <div ref={messagesEndRef} />
                </Box>

                        <Box sx={{ p: 2, borderTop: "1px solid #ccc", display: "flex", gap: 1 }}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
            />
            <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{ minWidth: 48, minHeight: 48, p: 0 }} // квадратная кнопка
            >
                <AttachFileIcon />
            </Button>

































































































            <Button
                variant="contained"
                color="success"
                onClick={sendMessage}
                sx={{ minWidth: 48, minHeight: 48, p: 0 }} // квадратная кнопка
            >
                <SendIcon />
            </Button>
        </Box>

                {uploadedFileUrl && (
                <Alert
                    color="info"
                    sx={{ position: "absolute", bottom: 80, right: 20, cursor: "pointer" }}
                    onClick={() => navigator.clipboard.writeText(uploadedFileUrl)}
                >
                    Ссылка на файл: {uploadedFileUrl} (скопировано при клике)
                </Alert>
                )}
            </>
            ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
                Выберите чат или создайте новый
            </Box>
            )}
        </Box>

        {/* Модальное окно создания чата */}
        <Modal open={createChatModalOpen} onClose={() => setCreateChatModalOpen(false)}>
        <Card sx={{ p: 3, minWidth: 300 }}>
            <Typography level="h6">Создать чат</Typography>
            <Input
            placeholder="Название чата"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            sx={{ my: 2 }}
            />
            <Input
            placeholder="Описание"
            value={newChatDesc}
            onChange={(e) => setNewChatDesc(e.target.value)}
            sx={{ my: 2 }}
            />
            <Input
            placeholder="ID участников через запятую"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            sx={{ my: 2 }}
            />
            <Button variant="outlined" onClick={() => chatImageInputRef.current?.click()}>Выбрать аватарку</Button>
            <input type="file" ref={chatImageInputRef} style={{ display: "none" }} onChange={handleChatImageChange} />
            <Button variant="solid" color="primary" sx={{ mt: 2 }} onClick={createChat}>Создать</Button>
        </Card>
        </Modal>

            {selectedChat ? (<Modal
    open={chatInfoModalOpen}
    onClose={() => setChatInfoModalOpen(false)}
    closeAfterTransition
    sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(30,0,60,0.6)",
    }}
    >
        <Card
        sx={{
            p: 4,
            maxWidth: "520px",
            width: "100%",
            borderRadius: 5,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            boxShadow: "0 20px 40px rgba(100,50,200,0.3)",
            background: "linear-gradient(145deg, #fef9ff, #f0e0ff)",
            border: "1px solid rgba(255,255,255,0.2)",
        }}
        >
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
            style={{ position: "relative", width: 64, height: 64, cursor: "pointer" }}
            onMouseEnter={() => setHoveringAvatar(true)}
            onMouseLeave={() => setHoveringAvatar(false)}
            >
            <Avatar
                src={avatarFile ? URL.createObjectURL(avatarFile) : selectedChat.image}
                alt={selectedChat.name}
                sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                filter: hoveringAvatar ? "brightness(60%)" : "none",
                transition: "0.3s",
                boxShadow: "0 0 15px rgba(200,150,255,0.5)",
                }}
            />
            {hoveringAvatar && (
                <label
                htmlFor="avatar-upload"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    backdropFilter: "blur(2px)",
                    borderRadius: "50%",
                }}
                >
                <CameraAltIcon fontSize="medium" />
                </label>
            )}
            <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setAvatarFile(e.target.files[0])}
            />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8,width:"100%",minWidth:0 }}>
            <Input
                value={selectedChat.name}
                onChange={(e) => setSelectedChat({ ...selectedChat, name: e.target.value })}
                placeholder="Название чата"
                sx={{
                p: 1.5,
                borderRadius: 3,
                width:"100%",
                border: "1px solid rgba(200,150,255,0.5)",
                background: "rgba(255,255,255,0.8)",
                transition: "0.2s",
                "&:focus": { borderColor: "#c896ff", boxShadow: "0 0 10px #c896ff" },
                }}
            />
            <Input
                value={selectedChat.description}
                onChange={(e) =>
                setSelectedChat({ ...selectedChat, description: e.target.value })
                }
                placeholder="Описание"
                sx={{
                p: 1.5,
                borderRadius: 3,

                width:"100%",
                border: "1px solid rgba(200,150,255,0.5)",
                background: "rgba(255,255,255,0.8)",
                transition: "0.2s",
                "&:focus": { borderColor: "#c896ff", boxShadow: "0 0 10px #c896ff" },
                }}
            />
            </div>
        </div>
    <Button
        onClick={() => handleSaveChatInfo(avatarFile)}
        sx={{
        width: "100%",
        p: 1.5,
        borderRadius: 4,
        bgcolor: "#c896ff",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "1rem",
        "&:hover": { bgcolor: "#a367ff", boxShadow: "0 0 15px #a367ff" },
        }}
    >
        Сохранить
    </Button>

        {/* USERS LIST */}
        {!addingMode ? (
            <>
            <div
                style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
                }}
            >
                <Typography variant="h6" sx={{ color: "#5a2fa0" }}>
                Участники ({selectedChat.users.length})
                </Typography>
                <Button
                variant="contained"
                onClick={() => setAddingMode(true)}
                sx={{
                    bgcolor: "#c896ff",
                    color:"white",
                    "&:hover": { bgcolor: "#a367ff", boxShadow: "0 0 10px #a367ff" },
                }}
                >
                Добавить
                </Button>
            </div>

            <List>
                {selectedChat.users.map((user) => (
                <ListItem
                    key={user.id}
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: 2,
                    p: 1,
                    "&:hover": { bgcolor: "rgba(200,150,255,0.1)" },
                    }}
                >
                    <Avatar src={user.avatar} sx={{ width: 36, height: 36 }} />
                    <Typography sx={{ color: "#4b1f8a" }}>{user.name}</Typography>
                </ListItem>
                ))}
            </List>
            </>
        ) : (
            <>
            <Typography variant="h6" sx={{ color: "#5a2fa0"}}>
                Добавить участника
            </Typography>
            <List>
                {users.map((user) => (
                <ListItem
                    key={user.id}
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: 2,
                    p: 1,
                    "&:hover": { bgcolor: "rgba(200,150,255,0.1)" },
                    }}
                >
                    <IconButton
                    color="primary"
                    onClick={() => {
                        handleAddUser(user.id);
                        setAddingMode(false);
                    }}
                    >
                    <AddIcon />
                    </IconButton>
                    <Avatar src={user.avatar} sx={{ width: 36, height: 36 }} />
                    <Typography sx={{ color: "#4b1f8a" }}>{user.name}</Typography>
                </ListItem>
                ))}
            </List>
            <Button
                variant="outlined"
                onClick={() => setAddingMode(false)}
                sx={{
                borderColor: "#c896ff",
                color: "#c896ff",
                "&:hover": { bgcolor: "rgba(200,150,255,0.1)" },
                }}
            >
                Назад
            </Button>
            </>
        )}
        </Card>
    </Modal>



): (<></>)}

        </Box>
        </CssVarsProvider>
        </>
    );
    }
