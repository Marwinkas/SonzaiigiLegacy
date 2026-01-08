import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
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
import Checkbox from '@mui/material/Checkbox';
import { TransitionGroup } from 'react-transition-group';
import Masonry from 'react-masonry-css';

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
    const filteredSongs = cards.filter((song) => song.title.toLowerCase());
    const getInitials = useInitials();
    const { auth } = usePage<SharedData>().props;
    const deletepost = async (targetUserId: Number) => {
        await Inertia.delete(`/post/delete/${targetUserId}`);
    };

    const agreepost = async (targetUserId: Number) => {
        await Inertia.post(`/post/agree/${targetUserId}`);
    };
    const declinepost = async (targetUserId: Number) => {
        await Inertia.post(`/post/decline/${targetUserId}`);
    };
    return (
        <AppLayout>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <Container sx={{ minHeight: '100vh', padding: 0 }} class="m-0">
                    <TransitionGroup className="m-0 flex flex-col w-[100%] flex-wrap gap-[2px] p-0 align-middle items-center justify-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Посты непроверенные модерацией</h2>
                        {filteredSongs.map((video) => (
                            <div>
                                {video.status == 0 && <Card className="overflow-hidden rounded-lg shadow-lg w-200">
                                    <CardContent className="p-0 flex items-center justify-between">
                                        <a href={`https://sonzaiigi.art/dashboard/${video.id}`} className="ml-2 text-white text-sm">{video.title}</a>

                                        <div class="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="contained"
                                                sx={{ backgroundColor: "red", color: "white" }}
                                                onClick={async () => await deletepost(video.id)}
                                            >
                                                Удалить пост
                                            </Button>
                                            {video.status == 0 && <Button
                                                type="button"
                                                variant="contained"
                                                sx={{ backgroundColor: "green", color: "white" }}
                                                onClick={async () => await agreepost(video.id)}
                                            >
                                                Разрешить пост
                                            </Button>}
                                        </div>

                                    </CardContent>
                                </Card>}
                            </div>
                        ))}
                        <h2 className="text-2xl font-bold text-white mb-4">Посты проверенные модерацией</h2>
                        {filteredSongs.map((video) => (
                            <div>
                                {video.status == 1 && <Card className="overflow-hidden rounded-lg shadow-lg w-200">
                                    <CardContent className="p-0 flex items-center justify-between">
                                        <a href={`https://sonzaiigi.art/dashboard/${video.id}`}  className="ml-2 text-white text-sm">{video.title}</a>
                                        <div class="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="contained"
                                                sx={{ backgroundColor: "red", color: "white" }}
                                                onClick={async () => await deletepost(video.id)}
                                            >
                                                Удалить пост
                                            </Button>
                                            {video.status == 1 && <Button
                                                type="button"
                                                variant="contained"
                                                sx={{ backgroundColor: "red", color: "white" }}
                                                onClick={async () => await declinepost(video.id)}
                                            >
                                                Убрать пост из ленты
                                            </Button>}
                                        </div>

                                    </CardContent>
                                </Card>}
                            </div>
                        ))}



                    </TransitionGroup>
                </Container>
            </ThemeProvider>
        </AppLayout>
    );
};

export default Music;
