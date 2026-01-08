import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import CloudUpload from '@mui/icons-material/CloudUpload';
import MusicNote from '@mui/icons-material/MusicNote';
import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Inertia } from '@inertiajs/inertia';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
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
  Avatar,
  Slider,
  Box,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Fade,
  Collapse
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
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';

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

interface Song {
  id: number;
  title: string;
  author: string;
  url: string;
  duration: number;
}

interface MusicProps {
  songs: Song[];
}

const Music: React.FC<MusicProps> = ({ songs  }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [imagefile, setImageFile] = useState<File | null>(null);
  const [audiofile, setAudioFile] = useState<File | null>(null);
  const [videofile, setVideoFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setImageFile(selectedFile);
      }
    }
  };
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setVideoFile(selectedFile);
      }
    }
  };
  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('audio/')) {
        setAudioFile(selectedFile);
      }
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
    formData.append('audio', audiofile);
  
    try {
      await Inertia.post(route('music.post'), formData);
      setTitle('');
      setAuthor('');
      setImageFile(null);
      setAudioFile(null);
      setVideoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (errors) {
      console.error('Upload error:', errors);
    }
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="m-auto mb-8 w-200">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block mb-1">Сообщение</label>
              <TextField 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                multiline
              />
            </div> 
            <div className="flex justify-between">
            <div className="flex gap-1">
            <div className="relative w-10 p-2 rounded bg-gray-800 border border-gray-700 cursor-pointer">
                <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={handleAudioFileChange}
                    ref={fileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center">
                    <MusicNoteIcon className="w-5 h-5" />
                </div>
            </div>
            </div>
            <button 
              type="submit" 
              className="w-50 py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded transition"
            >
              Создать пост
            </button>
            </div>
          </form>
        </div>

        

        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
        
        {/* Список треков */}
        <TransitionGroup>
          {filteredSongs.map((video) => (
            <Card sx={{ maxWidth: 1000 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                  {video.author.charAt(0).toUpperCase()}
                </Avatar>
              }
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
              title={video.author}
              subheader={new Date(video.created_at).toLocaleString()}
            />

            <CardContent>
              <Typography variant="body" sx={{ color: 'text.secondary' }}>
              {video.title}
              </Typography>
            {video.url && <CardMedia
              component="audio"
              height="194"
              image={video.url}
              controls
            />}
            </CardContent>
            <CardActions disableSpacing>
              <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} />
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