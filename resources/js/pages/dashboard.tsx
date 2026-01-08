import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Card, CardActions, CardContent, Container, createTheme, CssBaseline, TextField, ThemeProvider } from '@mui/material';

import PostDialog from "./PostDialog";


    import {
    Typography,
    Input,
    Box,
    Sheet,
    Modal,
    Alert,
    CssVarsProvider,
    extendTheme, ModalDialog, List, ListItem
    }
    from "@mui/joy";
import HomeIcon from '@mui/icons-material/Home';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ConstructionIcon from '@mui/icons-material/Construction';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Masonry from 'react-masonry-css';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsIcon from '@mui/icons-material/Directions';
import CreateIcon from '@mui/icons-material/Create';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import MessageIcon from '@mui/icons-material/Message';
import CustomInput from '../components/input';
import GroupIcon from '@mui/icons-material/Group';
const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};
// Кастомная тема
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1DB954',
        },
        secondary: {
            main: '#191414',
        },
        background: {
            default: '#000000',
            paper: '#121212',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});
const handleFollowToggle2 = async (cardId: string) => {
    await Inertia.post(`/cards/${cardId}/like`);
};
interface Song {
    id: number;
    title: string;
    author: string;
    url: string;
    duration: number;
}
interface MusicProps {
    cards: Song[];
}
const Music: React.FC<MusicProps> = ({ cards, cards2 }) => {
        const handleNavigate = (url: string) => {
            Inertia.visit(url);
            setMenuOpen(false); // закрываем меню при переходе
        };


    const filteredSongs = cards.filter((song) => song.title.toLowerCase());
    const getInitials = useInitials();
    const { auth } = usePage<SharedData>().props;
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [photo, setPhoto] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);
    const fileInputRef3 = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
        }
    };
    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();

        if (!title) {
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        let number = 0;
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file); // или просто `files[]`
            number += 1;
        });
        formData.append('count', number);
        formData.append('authorphoto', photo)
        try {
            await Inertia.post(route('dashboard.post'), formData);
            setTitle('');
            setAuthor('');
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (errors) {
            console.error('Upload error:', errors);
        }
    };
    const { props } = usePage();
    const [search, setSearch] = useState(props.search || '');
    const handleSearch = (e) => {
        e.preventDefault();
        Inertia.get(route('dashboard'), { search }, {
            preserveScroll: true,
            preserveState: true,
        });
    };
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const askQuestion = async () => {
        if (!title.trim()) return;

        setLoading(true);
        setResponse('');

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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", // замените на ваш ключ
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "mistralai/devstral-small:free",
                    messages: [{ role: "user", content: title + " сделай текст на русском и улучшь его" }]
                })
            });

            const data = await res.json();
            const answer = data.choices?.[0]?.message?.content || "No response.";
            setTitle(answer);
        } catch (error) {
            setTitle("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };
  const [opens, setOpens] = useState(false);

  const handleOpens = () => setOpens(true);
  const handleCloses = () => setOpens(false);

const [searchOpen, setSearchOpen] = useState(false);
    return (
         <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>

            {searchOpen && (
                <Box
                    onClick={() => setSearchOpen(false)}
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
        left: searchOpen ? 0 : "-220px", // чуть шире для плавного появления
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
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: "100%" }}
                        onSubmit={handleSearch}
                    >
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Поиск"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>
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
                        position: "fixed", // фиксируем
                        top: 0,
                        left: 0,
                        height: "100vh", // чтобы занимал всю высоту окна
                        zIndex: 1000, // поверх остального контента
                        backgroundColor: "background.paper", // чтобы не было прозрачности
                    }}
                >
                <IconButton onClick={() => setSearchOpen(!searchOpen)}>
                    <SearchIcon />
                </IconButton>
                    {auth.user && <IconButton onClick={handleOpens}>
                    <AddCircleIcon />
                </IconButton>}
                <Divider orientation="horizontal" flexItem sx={{ width: "100%", my: 1 }} />

               <IconButton onClick={() => Inertia.visit("/")}>
                    <HomeIcon />
                </IconButton>
                <IconButton onClick={() => Inertia.visit("/chats")}>
                    <MessageIcon />
                </IconButton>
                <IconButton onClick={() => Inertia.visit("/chats")} >
                    <GroupIcon />
                </IconButton>
                <Box sx={{ flex:1 }}></Box>
                {auth.user && (
                    <a href="/settings">
                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={"http://sonzaiigi.art/" + auth.user.photo}
                                alt={auth.user.name}
                            />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </a>
                )}
                {!auth.user && (
                    <a href="/login">
                        <IconButton onClick={() => Inertia.visit("/chats")} >
                            <GroupIcon />
                        </IconButton>
                    </a>
                )}
            </Sheet>
            <CssBaseline />




                    <Box sx={{ display: "flex", flexDirection: "column",width:"calc(100% - 60px)"  }}>
            <ThemeProvider theme={theme}>
                {auth.user && <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth >
                    <DialogTitle>Создать новый пост</DialogTitle>
                    <form onSubmit={handleUpload}>
                        <DialogContent dividers sx={{height:"130px"}}>
                            <CustomInput
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <div className="flex justify-between w-full">
                                <div className='flex gap-4'>
                                    <Button
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                        startIcon={<CloudUploadIcon />}
                                    >
                                        Загрузить файлы
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={handleAudioFileChange}
                                            ref={fileInputRef}
                                            multiple
                                        />
                                    </Button>
                                    <Button onClick={askQuestion} disabled={loading} variant="contained" startIcon={<ConstructionIcon />}>
                                        {loading ? "Думаю..." : "Улучшить текст"}
                                    </Button>
                                </div>
                                <div>
                                    <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                                        Отправить
                                    </Button>
                                </div>
                            </div>
                        </DialogActions>
                    </form>
                </Dialog>}
                <Container sx={{ minHeight: '100vh', padding: 0 }} class="m-0">
                    <TransitionGroup className="m-0 flex w-[100%] flex-wrap gap-[2px] p-0 align-middle items-center justify-center">
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="flex w-auto gap-4"
                            columnClassName="bg-clip-padding"
                        >
                            {filteredSongs.map((video) => (
                                <div key={video.id} className="mb-4">
                                    <Card className="overflow-hidden rounded-lg shadow-lg">
                                        <CardContent className="p-0">
                                            <div className="relative group overflow-hidden">
                                                <a href={`https://sonzaiigi.art/dashboard/${video.id}`}>
                                                {!video.imgurl.split(',')[0] && !video.audiourl.split(',')[0] && !video.videourl.split(',')[0] && <div

                                                className=' h-100'>

                                                    </div>}
                                                    {video.imgurl.split(',')[0] && <img
                                                        src={video.imgurl.split(',')[0]}
                                                        className="w-full object-cover"
                                                        alt={video.title}
                                                    />}
                                                    {!video.imgurl.split(',')[0] && video.audiourl.split(',')[0] && <img
                                                        src={"https://sonzaiigi.art/audio.png"}
                                                        className="w-full object-cover"
                                                        alt={video.title}
                                                    />}
                                                    {!video.imgurl.split(',')[0] && video.videourl.split(',')[0] && <img
                                                        src="https://sonzaiigi.art/video.png"
                                                        className="w-full object-cover"
                                                        alt={video.title}
                                                    />}
                                                    <Card
                                                        class="bg-[rgba(255, 99, 71, 0.2)] bg-gray-500/50 absolute inset-0 bg-opacity-50 opacity-0 group-hover:opacity-100 bg-opacity-10 flex flex-col justify-between transition-opacity duration-300 "
                                                    >
                                                        <a
                                                            href={`/profile/${video.user.id}`}
                                                            className="flex items-center p-2"
                                                        >
                                                            <Avatar className="h-8 w-8 overflow-hidden rounded-full ml-1">
                                                                <AvatarImage
                                                                    src={`https://sonzaiigi.art/${video.user.photo}`}
                                                                    alt={video.user.name}
                                                                />
                                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                    {getInitials(video.user.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <p className="ml-4 text-white text-sm">{video.user.name}</p>
                                                        </a>
                                                        {video.videourl.split(',')[0] && <img class="w-10 h-10 m-auto"
                                                            src={"https://sonzaiigi.art/video2.png"}
                                                        />}
                                                        <CardActions className="p-2" disableSpacing>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center">
                                                                    {auth.user && (
                                                                        <Checkbox
                                                                            checked={video.liked}
                                                                            onChange={async () => await handleFollowToggle2(video.id)}
                                                                            icon={<FavoriteBorder />}
                                                                            checkedIcon={<Favorite />}
                                                                        />
                                                                    )}
                                                                    <p className="ml-2 text-white text-sm">{video.title}</p>
                                                                </div>
                                                            </div>
                                                        </CardActions>
                                                    </Card>
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </Masonry>
                    </TransitionGroup>
                </Container>
            </ThemeProvider>


            <PostDialog open={opens} onClose={handleCloses} />
            </Box>
        </Box>
    );
};

export default Music;
