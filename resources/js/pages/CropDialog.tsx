import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Slider,
  Box,
  Typography
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Cropper from "react-easy-crop";

type CropDialogProps = {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImage: string, width: number, height: number) => void;
};

const CropDialog = ({ open, imageSrc, onClose, onSave }: CropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async () => {
    if (!croppedAreaPixels) return null;

    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    ctx!.drawImage(image, x, y, width, height, 0, 0, width, height);
    return {
      base64: canvas.toDataURL("image/jpeg"),
      width,
      height
    };
  };

  const handleSave = async () => {
    const result = await getCroppedImg();
    if (result) {
      onSave(result.base64, result.width, result.height);
      onClose();
    }
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Обрезка изображения
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 400,
            background: "#333"
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </Box>

        {/* Показ текущего разрешения */}
        {croppedAreaPixels && (
          <Typography sx={{ mt: 1 }}>
            Разрешение превью: {Math.round(croppedAreaPixels.width)} x{" "}
            {Math.round(croppedAreaPixels.height)}
          </Typography>
        )}

        {/* Слайдер для зума */}
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Зум</Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
          />
        </Box>

        {/* Кнопки аспектов */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button onClick={() => setAspect(1)}>1:1</Button>
          <Button onClick={() => setAspect(16 / 9)}>16:9</Button>
          <Button onClick={() => setAspect(9 / 16)}>9:16</Button>
        </Box>

        {/* Кнопки управления */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button onClick={resetCrop}>Сбросить</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CropDialog;
