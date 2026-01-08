import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Card, CardActions, CardContent, Container, createTheme, CssBaseline, TextField, ThemeProvider } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
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
    const filteredSongs = cards.filter((song) => song.title.toLowerCase());
    const getInitials = useInitials();
    const { auth } = usePage<SharedData>().props;

    const [title, setTitle] = useState('');
const [author, setAuthor] = useState('');
const [photo, setPhoto] = useState('');
const [files, setFiles] = useState<File[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const fileInputRef = useRef<HTMLInputElement>(null);
const fileInputRef2 = useRef<HTMLInputElement>(null);
const fileInputRef3 = useRef<HTMLInputElement>(null);

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
    formData.append('authorphoto',photo)
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
          "HTTP-Referer": "https://sonzaiigi.art", // опционально
          "X-Title": "My Chat App", // опционально
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/devstral-small:free",
          messages: [{ role: "user", content: title + " make this text better" }]
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
                        <form onSubmit={handleSearch} className="space-y-4">
            <div>
                <label className="mb-1 block text-white">Поиск карточек</label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
                    placeholder="Введите название или описание..."
                />
            </div>
            
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500"
                >
                    Найти
                </button>
            </div>
        </form>
            { auth.user &&<div className="m-auto mb-8 w-[100%]">
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="mb-1 block">Сообщение</label>
                            <TextField
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded border border-gray-700 bg-gray-800 p-2"
                                multiline
                            />
                        </div>
                        <div className="flex justify-between">
                            <div className="flex gap-1">
                                <div className="relative w-10 cursor-pointer rounded border border-gray-700 bg-gray-800 p-2">
                                    <input
                                        type="file"
                                        accept="audio/*,video/*,image/*"
                                        onChange={handleAudioFileChange}
                                        ref={fileInputRef}
                                        multiple
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="flex items-center justify-center">
                                    
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-50 rounded bg-blue-600 px-4 py-2 transition hover:bg-blue-500">
                                Создать пост
                            </button>
                            <button
                                onClick={askQuestion}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Думаю..." : "Улучшить текст"}
                            </button>

                        </div>
                    </form>
                </div>}
                <CssBaseline />
                <Container sx={{ py: 4, minHeight: '100vh', padding: 0, maxWidth: 10000 }}>
                    <h1 class=" text-center mb-5">Популярные за неделю</h1>
                    <TransitionGroup className="m-0 flex w-[100%] flex-wrap gap-[20px] p-0 align-middle items-center justify-center">                 
                    {cards2.map((video) => (
                        <Card
                                sx={{
                                    marginBottom: '20px',
                                    borderRadius: '15px',
                                    width: '200px',
                                    height: '250px',
                                    transition: 'opacity 0.3s',
                                    padding:"0",
                                    '&:hover': {
                                        opacity: 0.8,
                                    },
                                }}
                            >
                                <a href={"/profile/"+ video.user.id} class="flex items-center pb-2 pt-2">
                                        <Avatar className="h-8 w-8 overflow-hidden rounded-full  ml-1">
                                        <AvatarImage src={"http://sonzaiigi.art/" + video.user.photo} alt={video.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(video.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                        <p class="ml-5">{video.user.name}</p>
                                        </a>
                                <CardContent sx={{
                                    padding:"0",
                                }}>
                                    <a href={'http://sonzaiigi.art/dashboard/' + video.id}>
                                        <img src={video.imgurl.split(',')[0]} width="200px" class="h-40"></img>
                                    </a>
                                </CardContent>
                                
                                <CardActions sx={{
                                    padding:"0",
                                }} disableSpacing>
                                    <div class="flex flex-col">
                                        <div  class="flex items-center">
                                        { auth.user &&<Checkbox checked={video.liked} onChange={async () => await handleFollowToggle2(video.id)} icon={<FavoriteBorder />} checkedIcon={<Favorite />} />}
                                        <p  className="outlined-text">{video.title}</p>
                                    </div>
                    
                              
                                    </div>
                                </CardActions>
                            </Card>
                         ))}
                         </TransitionGroup>
                         <h1 class=" text-center mb-5">Новые</h1>
                    <TransitionGroup className="m-0 flex w-[100%] flex-wrap gap-[20px] p-0 align-middle items-center justify-center">
                        
                        
                         
                        {filteredSongs.map((video) => (
                            <Card
                                sx={{
                                    marginBottom: '20px',
                                    borderRadius: '15px',
                                    width: '200px',
                                    height: '250px',
                                    transition: 'opacity 0.3s',
                                    padding:"0",
                                    '&:hover': {
                                        opacity: 0.8,
                                    },
                                }}
                            >
                                <a href={"/profile/"+ video.user.id} class="flex items-center pb-2 pt-2">
                                        <Avatar className="h-8 w-8 overflow-hidden rounded-full  ml-1">
                                        <AvatarImage src={"http://sonzaiigi.art/" + video.user.photo} alt={video.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(video.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                        <p class="ml-5">{video.user.name}</p>
                                        </a>
                                <CardContent sx={{
                                    padding:"0",
                                }}>
                                    <a href={'http://sonzaiigi.art/dashboard/' + video.id}>
                                        <img src={video.imgurl.split(',')[0]} width="200px" class="h-40"></img>
                                    </a>
                                </CardContent>
                                
                                <CardActions sx={{
                                    padding:"0",
                                }} disableSpacing>
                                    <div class="flex flex-col">
                                        <div  class="flex items-center">
                                        { auth.user &&<Checkbox checked={video.liked} onChange={async () => await handleFollowToggle2(video.id)} icon={<FavoriteBorder />} checkedIcon={<Favorite />} />}
                                        <p  className="outlined-text">{video.title}</p>
                                    </div>
                    
                              
                                    </div>
                                </CardActions>
                            </Card>
                        ))}
                    </TransitionGroup>
                </Container>
            </ThemeProvider>
        </AppLayout>
    );
};

export default Music;
