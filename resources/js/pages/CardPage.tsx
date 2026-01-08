import Sliders from 'react-slick';
import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Inertia } from '@inertiajs/inertia';
import Masonry from 'react-masonry-css';
import {
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    Box,
    createTheme,
    ThemeProvider,
    CssBaseline,
} from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import CopyLinkButton from './Buttons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePage } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { useForm } from '@inertiajs/react';

import { router } from '@inertiajs/react';
import axios from 'axios';
import { useTransition } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ConstructionIcon from '@mui/icons-material/Construction';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import EditIcon from '@mui/icons-material/Edit';

import MyPlayer from './videos';
import { CssVarsProvider } from '@mui/joy/styles';
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
const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Главная',
        href: '/settings/profile',
    },
];

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

interface Comment {
    id: number;
    user: { name: string; photo?: string };
    body: string;
    created_at: string;
}
interface Song {
    id: number;
    title: string;
    author: string;
    authorphoto: string;
    url: string;
    duration: number;
    imgurl?: string;
    videourl?: string;
    audiourl?: string;
    created_at: string;
    comments: Comment[];
    liked?: boolean;
    user: { id: number; name: string; photo?: string };
}

interface MusicProps {
    card: Song;
    comments: Comment[];
    recentCards: Song[];
    randomCards: Song[];
    count: number;
    like: boolean;
    subscriber: boolean;
    subscribercount: number;
}

const Music: React.FC<MusicProps> = ({ card, comments, recentCards, randomCards, count, like, subscriber, subscribercount }) => {
    const getInitials = useInitials();
    const [subscribed, setSubscribed] = useState(subscriber);
    const [subscribersCount, setSubscribersCount] = useState(subscribercount);

    const [checked, setChecked] = useState(like);
    const [counted, setCounted] = useState(count);
    const { auth } = usePage<SharedData>().props;
    const [isPending, startTrans] = useTransition();
    function SampleNextArrow(props) {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{ ...style, display: "block" }}
                onClick={onClick}
            />
        );
    }

    function SamplePrevArrow(props) {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{ ...style, display: "block" }}
                onClick={onClick}
            />
        );
    }

    const handleFollowToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // моментально меняем UI: оптимистичный режим
        setChecked(prev => !prev);
        setCounted(prev => prev + (checked ? -1 : 1));
        const path = window.location.pathname; // '/cards/2'
        const cardId = path.split('/')[2];     // '2'
        try {
            const { data } = await axios.post<{ liked: boolean; likesCount: number }>(
                `/cards/${cardId}/like2`
            );

            // подтверждаем данные с сервера (на случай гонки)
            startTrans(() => {
                setChecked(data.liked);
                setCounted(data.likesCount);
            });
        } catch (e) {
            // При ошибке — откатываем
            setChecked(like);
            setCounted(count);
            console.error('Не удалось поставить лайк', e);
        }
    };

    const handleFollowToggle2 = async (cardId: string) => {
        await Inertia.post(`/cards/${cardId}/like`);
    };

    const handleFollowToggle3 = async (targetUserId: Number) => {
        await Inertia.post(`/subscriptions/toggle/${targetUserId}`);
    };
    const deletepost = async (targetUserId: Number) => {
        await Inertia.delete(`/post/delete/${targetUserId}`);
    };
    const settings = {
        dots: true, // показывать точки для переключения слайдов
        infinite: true, // бесконечный цикл слайдов
        speed: 500, // скорость переключения
        slidesToShow: 1, // количество слайдов, показываемых одновременно
        slidesToScroll: 1, // количество слайдов для прокрутки

        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        customPaging: i => (
            <div
                style={{
                    width: "30px",
                    color: "white",
                    border: "1px white solid"
                }}
            >
                {i + 1}
            </div>
        )
    };

    const { data, setData, reset, post } = useForm({
        card_id: card.id,
        body: '',
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

        if (!title.trim()) return;

        // 1. Формируем данные
        const formData = new FormData();
        formData.append('_method', 'put');        // Laravel увидит PUT
        formData.append('title', title);
        formData.append('author', author);

        files.forEach((file, i) => formData.append(`files[${i}]`, file));
        formData.append('count', files.length.toString());

        if (photo) {
            formData.append('authorphoto', photo);
        }

        // 2. ID карточки (берём либо из пропсов, либо из URL)
        //    Допустим, путь вида /cards/2
        const cardId = window.location.pathname.split('/').pop(); // '2'

        // 3. Отправляем
        router.post(
            route('dashboard.update', { id: cardId }),      // /dashboard/2
            formData,
            {
                forceFormData: true,                 // обязательно!
                preserveScroll: true,
                onSuccess: () => {
                    setTitle('');
                    setAuthor('');
                    setFiles([]);
                    fileInputRef.current?.value && (fileInputRef.current.value = '');
                },
                onError: (err) => console.error('Upload error:', err),
            },
        );
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>

                    {/* Список треков */}

                    <Card sx={{ maxWidth: 1200, marginBottom: "20px", borderRadius: "15px", width: "100%", padding: "24px" }}>


                        <CardContent sx={{ maxWidth: 1000, width: "100%" }} >
                            <div className="w-full">

                                {card.imgurl && card.imgurl.split(',').length > 1 && <Sliders {...settings} class="h-128 w-128 bg object-contain">
                                    {card.imgurl && card.imgurl.split(',').map((url, index) => (
                                        <CardMedia
                                            class="h-full mw-full bg object-contain bg-black max-h-128 w-full"
                                            component="img"
                                            image={url}
                                        />
                                    ))}

                                </Sliders>}

                                {card.imgurl && card.imgurl.split(',').length == 1 && <CardMedia
                                    class="h-128 w-full bg object-contain bg-black"
                                    component="img"
                                    image={card.imgurl}
                                    sx={{ width: "100%" }}
                                />}
                                {card.videourl && card.videourl.split(',').length > 1 && <Sliders {...settings} >
                                    {card.videourl && card.videourl.split(',').map((url, index) => (
                                        <CardMedia
                                            class="h-128 w-128 bg object-contain bg-black"
                                            component="video"
                                            controls
                                            image={url + "_1080p.webm"}
                                        />
                                    ))}
                                </Sliders>}
                                {card.videourl && card.videourl.split(',').length == 1 && <MyPlayer src={card.videourl + "_1080p.webm"} />}

                                {card.audiourl && card.audiourl.split(',').map((url, index) => (
                                    <CardMedia
                                        component="audio"
                                        image={url}
                                        controls
                                        sx={{ marginTop: "10px" }}
                                    />
                                ))}
                            </div>
                            <div className='flex items-center flex-wrap mt-5'>
                                <Typography variant="body" sx={{ color: 'text.secondary' }}>
                                    {new Date(card.created_at).toLocaleString()}
                                </Typography>
                                <div className='ml-auto'></div>
                                {auth.user && <Checkbox
                                    checked={checked}
                                    onChange={handleFollowToggle}
                                    icon={<FavoriteBorder />}
                                    checkedIcon={<Favorite />}
                                />}
                                <Typography variant="body" sx={{ color: 'text.secondary' }}>
                                    {counted}
                                </Typography>
                                <CopyLinkButton link={"https://sonzaiigi.art/dashboard/" + card.id} />
                            </div>
                            <div><Typography variant="h5" sx={{ color: 'text.secondary' }}>
                                {card.title}
                            </Typography></div>
                        </CardContent>
                        <CardHeader

                            title={
                                <div>
                                    <div class="flex flex-wrap">
                                        <a href={"/profile/" + card.user.id} class="flex">
                                            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                <AvatarImage src={"https://sonzaiigi.art/" + card.user.photo} alt={card.user.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(card.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p class="ml-5" className="outlined-text">{card.user.name}</p>
                                        </a>
                                        {auth.user && <Button
                                            type="button"
                                            variant="contained"
                                            sx={{ marginLeft: "20px", color: "white", fontWeight: "600" }}
                                            onClick={async () => await handleFollowToggle3(card.user.id)}
                                        >
                                            {subscribed ? "Отписаться" : "Подписаться"} ({subscribersCount})
                                        </Button>}
                                        {auth.user && card.user.id == auth.user.id && <Button
                                            type="button"
                                            variant="contained"
                                            sx={{ backgroundColor: "red", color: "white" }}
                                            onClick={async () => await deletepost(card.id)}
                                        >
                                            Удалить пост
                                        </Button>

                                        }
                                        {auth.user && card.user.id == auth.user.id && <Button
                                            variant="contained"
                                            endIcon={<EditIcon />}
                                            sx={{ width: '180px' }}
                                            onClick={handleOpen}
                                        >
                                            Изменить пост
                                        </Button>}
                                    </div>
                                    <div class="flex flex-wrap">
                                        {recentCards.map((video) => (
                                            <Card
                                                sx={{
                                                    marginTop: "20px",
                                                    marginRight: "10px",
                                                    borderRadius: '15px',
                                                    width: '150px',
                                                    height: '150px',
                                                    transition: 'opacity 0.3s',
                                                    '&:hover': {
                                                        opacity: 0.8,
                                                    },
                                                }}
                                                className="bg-cover bg-center bg-no-repeat"
                                                style={{ backgroundImage: `url(${video.imgurl.split(',')[0]})` }}
                                            >
                                                <CardContent className=" h-25">
                                                    <a href={'https://sonzaiigi.art/dashboard/' + video.id}>
                                                        <div className="h-full"></div>
                                                    </a>
                                                </CardContent>
                                                <CardActions disableSpacing>
                                                    {auth.user && <Checkbox checked={video.liked} onChange={async () => await handleFollowToggle2(video.id)} icon={<FavoriteBorder />} checkedIcon={<Favorite />} />}
                                                    <p className="outlined-text">{video.title}</p>
                                                </CardActions>
                                            </Card>
                                        ))}</div>
                                </div>}
                        />
                        <CardActions disableSpacing>

                        </CardActions>
                    </Card>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Комментарии</Typography>

                        {auth.user && <form onSubmit={(e) => {
                            e.preventDefault();
                            post(route('comments.store'), {
                                onSuccess: () => reset('body')
                            });
                        }}>
                            <Box className="flex mt-3">
                                <Avatar className="h-11 w-11 overflow-hidden rounded-full  mr-2.5 mt-2">
                                    <AvatarImage src={"https://sonzaiigi.art/" + auth.user.photo} />
                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={1}
                                    variant="outlined"
                                    placeholder="Оставить комментарий..."
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    className='h-16'
                                />
                                <Button type="submit" variant="contained" sx={{ marginLeft: "10px" }} className='h-13 mt-5'>Отправить</Button>
                            </Box>
                            <input type="hidden" name="song_id" value={card.id} />
                        </form>}

                        <List>
                            {comments.map((comment) => (
                                <ListItem key={comment.id} sx={{ justifyContent: "flex-start", padding: "0" }}>
                                    <Avatar className="h-11 w-11 overflow-hidden rounded-full  mr-2.5 mt-2">
                                        <AvatarImage src={"https://sonzaiigi.art/" + comment.user.photo} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(comment.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ListItemText
                                        primary={`${comment.user.name} • ${new Date(comment.created_at).toLocaleString()}`}
                                        secondary={comment.body}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Container>

                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Typography variant="h4" gutterBottom>Похожие Работы</Typography>
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="flex w-auto gap-4"
                        columnClassName="bg-clip-padding"
                    >
                        {randomCards.map((video) => (
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
                </Container>


                {auth.user && card.user.id == auth.user.id && <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth >
                    <DialogTitle>Отредактировать пост</DialogTitle>
                    <form onSubmit={handleUpload}>
                        <DialogContent dividers sx={{ height: "130px" }}>
                       <TextField
                            placeholder="Напишите что-нибудь сюда…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            minRows={2}
                            maxRows={4}
                            sx={{ minWidth: 300, width: "100%", backgroundColor:"black", color:"white"}}
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
            </ThemeProvider>
        </AppLayout>
    );
};

export default Music;
