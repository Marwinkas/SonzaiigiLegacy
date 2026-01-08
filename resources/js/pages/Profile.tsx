import PlayArrow from '@mui/icons-material/PlayArrow';
import Sliders from 'react-slick';
import Pause from '@mui/icons-material/Pause';
import CloudUpload from '@mui/icons-material/CloudUpload';
import MusicNote from '@mui/icons-material/MusicNote';
import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Inertia } from '@inertiajs/inertia';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import {
  Container,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  CardActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Slider,
  Box,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Fade,
  Collapse,
} from '@mui/material';
import {
  SkipNext,
  SkipPrevious,
  VolumeUp,
  Search
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { TransitionGroup } from 'react-transition-group';
import ImageIcon from '@mui/icons-material/Image';
import cardCameraBackIcon from '@mui/icons-material/cardCameraBack';

import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Checkbox from '@mui/material/Checkbox';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CopyLinkButton from './Buttons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePage } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { useForm } from '@inertiajs/react';
import { Helmet } from 'react-helmet';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Главная',
    href: '/settings/profile',
  },
];
interface Comment {
  id: number;
  user: {
    name: string;
    photo?: string;
  };
  body: string;
  created_at: string;
}

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
}

interface MusicProps {
  card: Song;
}

const Profile: React.FC<MusicProps> = ({ recentCards,subscriber,subscribercount}) => {
  const getInitials = useInitials();
     const [subscribed, setSubscribed] = useState(subscriber);
    const [subscribersCount, setSubscribersCount] = useState(subscribercount);
  const [checked, setChecked] = useState(false);
  const { auth } = usePage<SharedData>().props;
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
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
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div

      />
    );
  }
  const handleFollowToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const path = window.location.pathname; // '/cards/2'
  const cardId = path.split('/')[2];     // '2'
  await Inertia.post(`/cards/${cardId}/like`);
  };
  const handleFollowToggle3 = async (targetUserId: string) => {
    await Inertia.post(`/subscriptions/toggle/${targetUserId}`);
  };
  const handleFollowToggle2 = async (cardId: string) => {
  await Inertia.post(`/cards/${cardId}/like`);
};
  const settings = {
    dots: false, // показывать точки для переключения слайдов
    infinite: true, // бесконечный цикл слайдов
    speed: 500, // скорость переключения
    slidesToShow: 1, // количество слайдов, показываемых одновременно
    slidesToScroll: 1, // количество слайдов для прокрутки
    nextArrow: <SamplePrevArrow />,
    prevArrow: <SamplePrevArrow />
  };


  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        console.log('Ссылка скопирована!');
      })
      .catch((err) => {
        console.error('Ошибка при копировании: ', err);
      });
  }
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
        <Helmet>
          <title>Profile {recentCards[0].user.name} — Sonzaiigi</title>
        </Helmet>
          {/* Список треков */}
          <TransitionGroup>
            <div>
                    <div class="flex">
                    <a href={"/profile/"+ recentCards[0].user.id} class="flex">
                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                    <AvatarImage src={"http://sonzaiigi.art/" + recentCards[0].user.photo} alt={recentCards[0].user.name} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(recentCards[0].user.name)}
                    </AvatarFallback>
                  </Avatar>
                      <p class="ml-5">{recentCards[0].user.name}</p>
                     </a>
                                              { auth.user &&<Button
                                                  type="button"
                                                  variant="contained"
                                                  sx={{ marginLeft: "20px", color: "white", fontWeight: "600" }}
                                                  onClick={async () => await handleFollowToggle3(recentCards[0].user.id)}
                                                >
                                                  {subscribed ? "Unfollow" : "Follow"} ({subscribersCount})
                                                </Button>}
                    </div>
                    <div class="flex flex-wrap">
                      {recentCards.map((video) => (
                        <Card
                          sx={{
                            marginTop:"20px",
                            marginRight:"10px",
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
                            <a href={'http://sonzaiigi.art/dashboard/' + video.id}>
                              <div className="h-full"></div>
                            </a>
                          </CardContent>
                          <CardActions disableSpacing>
                             { auth.user &&<Checkbox checked={video.liked} onChange={async () => await handleFollowToggle2(video.id)} icon={<FavoriteBorder />} checkedIcon={<Favorite />} />}
                            <p  className="outlined-text">{video.title}</p>
                          </CardActions>
                        </Card>
                      ))}</div>
                  </div>
          </TransitionGroup>
        </Container>
      </ThemeProvider>
    </AppLayout>
  );
};

export default Profile;
