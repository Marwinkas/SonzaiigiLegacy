import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

const CopyLinkButton = ({ link }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link)
      .then(() => {
        console.log('Ссылка скопирована!');
      })
      .catch((err) => {
        console.error('Ошибка при копировании: ', err);
      });
  };

  return (
    <Tooltip title="Скопировать ссылку">
      <IconButton onClick={handleCopyLink}>
        <ShareIcon />
      </IconButton>
    </Tooltip>
  );
};

export default CopyLinkButton;