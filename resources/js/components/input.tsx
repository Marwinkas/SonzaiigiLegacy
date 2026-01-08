import * as React from 'react';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import TextField from '@mui/material/TextField';

import Typography from '@mui/joy/Typography';
import { CssVarsProvider } from '@mui/joy/styles';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { Popper } from '@mui/base';
import Picker from '@emoji-mart/react'; // ✅ Новый импорт
import data from '@emoji-mart/data';    // Нужно для emoji data

interface CustomInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function CustomInput({ value, onChange }: CustomInputProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const pickerOpen = Boolean(anchorEl);

  const handleEmojiSelect = (emoji: any) => {
    const newValue = value + emoji.native;
    const event = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  const togglePicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  return (

      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          placeholder="Напишите что-нибудь сюда…"
          value={value}
          onChange={onChange}
          minRows={2}
          maxRows={4}

          sx={{ minWidth: 300, backgroundColor:"black", color:"white"}}
        />

<Popper
  open={pickerOpen}
  anchorEl={anchorEl}
  placement="top-start"
  modifiers={[
    {
      name: 'zIndex',
      enabled: true,
      phase: 'beforeWrite',
      fn: ({ state }) => {
        state.styles.popper.zIndex = '2500';
      },
    },
  ]}
>
  <Box>
    <Picker
      data={data}
      onEmojiSelect={handleEmojiSelect}
      theme="dark"
    />
  </Box>
</Popper>
      </Box>
  );
}
