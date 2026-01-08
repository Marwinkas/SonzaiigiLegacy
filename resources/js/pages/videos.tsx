// src/components/MyPlayer.tsx
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';


import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';



interface Props {
  src: string;
}

export default function MyPlayer({ src }: Props) {
  return (
<MediaPlayer title="TUYU" src={src} playsInline>
  <MediaProvider />
  <DefaultAudioLayout  colorScheme="dark" icons={defaultLayoutIcons} />
  <DefaultVideoLayout  colorScheme="dark" icons={defaultLayoutIcons} />
</MediaPlayer>


  );
}
