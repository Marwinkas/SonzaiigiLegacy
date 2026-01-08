import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Box,
  Typography,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import CropDialog from "./CropDialog";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PostDialogProps = {
  open: boolean;
  onClose: () => void;
};

// Сортируемый элемент
function SortableItem({ id, image, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: 80,
    height: 80,
    position: "relative"
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={image.preview}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
      />
      <IconButton
        size="small"
        onClick={onDelete}
        sx={{ position: "absolute", top: 0, left: 0, background: "rgba(0,0,0,0.5)", color: "#fff" }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function PostDialog({ open, onClose }: PostDialogProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [isAdult, setIsAdult] = useState(false);
  const [isAI, setIsAI] = useState(false);
    const [showList, setShowList] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [croppedImage, setCroppedImage] = useState("");
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  const [mode, setMode] = useState<"gallery" | "extended">("gallery");
  const [viewMode, setViewMode] = useState<"slider" | "list" | "wrap">("wrap");

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    if (e.target.value.includes(",")) {
      const newTags = e.target.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      setTags([...tags, ...newTags]);
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  type ImageType = {
    id: string; // уникальный id
    file: File;
    preview: string;
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(), // уникальный id
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCropDialogOpen(true);
    }
  };

  const getPaddingTop = () => {
    return `${(previewSize.height / previewSize.width) * 100}%`;
  };

  const sensors = useSensors(useSensor(PointerSensor));



    const [currentIndex, setCurrentIndex] = useState(0);


  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (idx) => {
    setCurrentIndex(idx);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          Создание поста
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Левая часть (Превью) */}
            {step === 1 && (
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h6">Превью поста</Typography>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      paddingTop: getPaddingTop(),
                      border: "1px solid #ccc",
                      mt: 2
                    }}
                  >
                    {croppedImage && (
                      <img
                        src={croppedImage}
                        alt="preview"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                    )}

                    {title && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          color: "#fff",
                          backgroundColor: "rgba(0,0,0,0.5)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontWeight: "bold",
                          maxWidth: "90%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {title}
                      </Box>
                    )}

                    {isAI && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          px: 1,
                          borderRadius: 1,
                          fontSize: 12
                        }}
                      >
                        AI
                      </Box>
                    )}
                    {isAdult && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "rgba(255,0,0,0.7)",
                          color: "#fff",
                          px: 1,
                          borderRadius: 1,
                          fontSize: 12
                        }}
                      >
                        18+
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Правая часть */}
            <Grid item xs={step === 1 ? 8 : 12}>
              {step === 1 && (
                <>
                  <TextField
                    label="Название"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Теги"
                    fullWidth
                    value={tagInput}
                    onChange={handleTagInput}
                    placeholder="Введите теги через запятую"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                      />
                    ))}
                  </Box>

                  <Typography sx={{ mt: 2 }}>Доп. функции:</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAdult}
                        onChange={() => setIsAdult(!isAdult)}
                      />
                    }
                    label="18+"
                  />
                  <FormControlLabel
                    control={
                      <Switch checked={isAI} onChange={() => setIsAI(!isAI)} />
                    }
                    label="AI"
                  />

                  <Typography sx={{ mt: 2 }}>Загрузите главное фото:</Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                  />

                  {croppedImage && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setCropDialogOpen(true)}
                      >
                        Редактировать
                      </Button>
                    </Box>
                  )}
                </>
              )}

{step === 2 && (
  <Grid container spacing={3}>
    <Grid item xs={6}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Режим отображения:
      </Typography>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, newView) => newView && setViewMode(newView)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="slider">Слайдер</ToggleButton>
        <ToggleButton value="list">Список</ToggleButton>
      </ToggleButtonGroup>

      <Box {...getRootProps()} sx={{ border: "1px dashed #ccc", p: 2 }}>
        <input {...getInputProps()} />
        <Typography>
          Перетащите фото или нажмите для загрузки
        </Typography>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            const oldIndex = images.findIndex(img => img.id === active.id);
            const newIndex = images.findIndex(img => img.id === over.id);
            setImages(arrayMove(images, oldIndex, newIndex));
          }
        }}
      >
        <SortableContext items={images.map(img => img.id)}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            {images.map((img, index) => (
              <SortableItem
                key={img.id}
                id={img.id}
                image={img}
                onDelete={() => removeImage(index)}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Grid>

    {/* Превью справа */}
    <Grid item xs={6}>
      <Paper sx={{ p: 2, height: "100%", overflow: "hidden" }}>
{viewMode === "slider" && images.length > 0 && (
  <Box
    sx={{
      position: "relative",
      width: 1000,
      height: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 auto",
      backgroundColor: "#000",
    }}
  >
    <img
      src={images[currentIndex].preview}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />

    {/* Стрелка влево */}
    {images.length > 1 && (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          cursor: "pointer",
          fontSize: 40,
          color: "#fff",
          userSelect: "none",
        }}
        onClick={() => {
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );
        }}
      >
        &#10094;
      </Box>
    )}

    {/* Стрелка вправо */}
    {images.length > 1 && (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          cursor: "pointer",
          fontSize: 40,
          color: "#fff",
          userSelect: "none",
        }}
        onClick={() => {
          setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
          );
        }}
      >
        &#10095;
      </Box>
    )}

    {/* Превьюшки */}
    {images.length > 1 && (
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.preview}
            alt=""
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              border: idx === currentIndex ? "2px solid #fff" : "1px solid #fff",
              cursor: "pointer",
            }}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </Box>
    )}
  </Box>
)}
    {viewMode === "list" && images.length > 0 && <Box
  sx={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  }}
>
  {/* Первое фото */}
  <Box
    sx={{
      width: 1000,
      maxWidth: 1000,
      maxHeight: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    }}
  >
    <img
      src={images[0].preview}
      alt=""
      style={{
        maxWidth: "1000px",
        maxHeight: "1000px",
        width: "auto",
        height: "auto",
        objectFit: "contain",
      }}
    />

    {images.length > 1 && (
      <Box
        onClick={() => setShowList(!showList)}
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 50,
          bgcolor: "rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Box>
    )}
  </Box>

      {/* Остальные фото */}
    {showList && (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {images.slice(1).map((img, idx) => (
        <img
            key={idx}
            src={img.preview}
            alt=""
            style={{
            maxWidth: "1000px",
            maxHeight: "1000px",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            }}
        />
        ))}
    </Box>
    )}
    </Box>}
      </Paper>
    </Grid>
  </Grid>
)}

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                {step > 1 && (
                  <Button variant="outlined" onClick={() => setStep(step - 1)}>
                    Назад
                  </Button>
                )}
                {step < 2 && (
                  <Button variant="contained" onClick={() => setStep(step + 1)}>
                    Далее
                  </Button>
                )}
                {step === 2 && (
                  <Button variant="contained" color="success">
                    Опубликовать
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <CropDialog
        open={cropDialogOpen}
        imageSrc={previewUrl}
        onClose={() => setCropDialogOpen(false)}
        onSave={(img, width, height) => {
          setCroppedImage(img);
          setPreviewSize({ width, height });
        }}
      />
    </>
  );
}
