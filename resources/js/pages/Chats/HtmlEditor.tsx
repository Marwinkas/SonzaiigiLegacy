    import React, { useRef, useState, useEffect } from 'react';
    import {
    Box,
    Button,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider,
    Typography,
    } from '@mui/material';
    import { HexColorPicker } from 'react-colorful';

    const HtmlEditor = () => {
    const editorRef = useRef(null);
    const [html, setHtml] = useState('');

    // Диалоги
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [fontSizeDialogOpen, setFontSizeDialogOpen] = useState(false);
    const [colorDialogOpen, setColorDialogOpen] = useState(false);

    // Основные состояния
    const [url, setUrl] = useState('');
    const [savedRange, setSavedRange] = useState(null);
    const [fontSize, setFontSize] = useState(16);
    const [color, setColor] = useState('#000000');
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Выделенное медиа для изменения размеров
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaWidth, setMediaWidth] = useState(300);
    const [mediaHeight, setMediaHeight] = useState(200);
    const [aspectRatio, setAspectRatio] = useState('custom');

    const aspectRatios = {
        '1:1': 1,
        '16:9': 16 / 9,
        '9:16': 9 / 16,
        '1:2': 1 / 2,
        '2:1': 2 / 1,
    };

    // ===== Основные функции =====
    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        updateHtml();
    };

    const handleInput = () => {
        updateHtml();
    };

    const updateHtml = () => {
        if (editorRef.current) setHtml(editorRef.current.innerHTML);
    };

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0));
    };

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (sel && savedRange) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
        }
    };

    const insertHtmlAtCursor = (htmlContent) => {
        restoreSelection();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = temp.firstChild)) frag.appendChild(node);
        range.insertNode(frag);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        updateHtml();
        setSavedRange(null);
    };

    // ===== Ссылки =====
    const applyLink = () => {
        restoreSelection();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const selText = range.toString();
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.textContent = selText || url;
        if (selText) range.deleteContents();
        range.insertNode(a);
        range.setStartAfter(a);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        updateHtml();
        setLinkDialogOpen(false);
        setUrl('');
        setSavedRange(null);
    };

    // ===== Изображения =====
const applyImage = () => {
    const selectedText = window.getSelection().toString();
    const width = Math.min(mediaWidth, 1000);
    const height = Math.min(mediaHeight, 1000);
    const imgHtml = `<img src="${url}" alt="${selectedText}" width="${width}" height="${height}" style="max-width: 100%;" />`;
    insertHtmlAtCursor(imgHtml);
    setImageDialogOpen(false);
    setUrl('');
};

const applyVideo = () => {
    const width = Math.min(mediaWidth, 1000);
    const height = Math.min(mediaHeight, 1000);
    const videoHtml = `<video src="${url}" controls width="${width}" height="${height}" style="max-width: 100%;"></video>`;
    insertHtmlAtCursor(videoHtml);
    setVideoDialogOpen(false);
    setUrl('');
};
    // ===== Локальная загрузка файлов =====
    const handleFileUpload = (e, type = 'image') => {
        const file = e.target.files[0];
        if (!file) return;

        saveSelection();
        const reader = new FileReader();
        reader.onload = (event) => {
        const dataUrl = event.target.result;

        if (type === 'video') {
            insertHtmlAtCursor(
            `<video src="${dataUrl}" controls width="${mediaWidth}" height="${mediaHeight}"></video>`
            );
        } else {
            insertHtmlAtCursor(
            `<img src="${dataUrl}" width="${mediaWidth}" height="${mediaHeight}" />`
            );
        }
        setUploadedFiles((prev) => [...prev, { file, dataUrl }]);
        };
        reader.readAsDataURL(file);
    };

    // ===== Шрифт и цвет =====
    const applyFontSize = () => {
        handleCommand('fontSize', 7);
        const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
        fontElements.forEach((el) => {
        el.removeAttribute('size');
        el.style.fontSize = `${fontSize}px`;
        });
        setFontSizeDialogOpen(false);
        setSavedRange(null);
        updateHtml();
    };

    const applyColor = () => {
        handleCommand('foreColor', color);
        setColorDialogOpen(false);
        setSavedRange(null);
    };

    const handleMediaClick = (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        setSelectedMedia(e.target);
        setMediaWidth(e.target.width);
        setMediaHeight(e.target.height);
        // aspectRatio больше не нужен
        e.stopPropagation();
    } else {
        setSelectedMedia(null);
    }
    };

const handleWidthChange = (val) => {
    const newVal = Math.min(val, 1000);
    setMediaWidth(newVal);
    if (!selectedMedia) return;

    if (aspectRatio !== 'custom') {
        const ratio = aspectRatios[aspectRatio];
        selectedMedia.style.width = `${newVal}px`;
        selectedMedia.style.height = `${Math.min(newVal / ratio, 1000)}px`;
        setMediaHeight(Math.min(newVal / ratio, 1000));
    } else {
        selectedMedia.style.width = `${newVal}px`;
    }
    handleInput();
};

const handleHeightChange = (val) => {
    const newVal = Math.min(val, 1000);
    setMediaHeight(newVal);
    if (!selectedMedia) return;

    if (aspectRatio !== 'custom') {
        const ratio = aspectRatios[aspectRatio];
        selectedMedia.style.height = `${newVal}px`;
        selectedMedia.style.width = `${Math.min(newVal * ratio, 1000)}px`;
        setMediaWidth(Math.min(newVal * ratio, 1000));
    } else {
        selectedMedia.style.height = `${newVal}px`;
    }
    handleInput();
};
    // ===== Drag Handles =====
    const startDrag = (e, corner) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = selectedMedia.width;
    const startHeight = selectedMedia.height;

    const onMouseMove = (moveEvent) => {
        let dx = moveEvent.clientX - startX;
        let dy = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        switch (corner) {
        case 'br':
            newWidth = startWidth + dx;
            newHeight = startHeight + dy;
            break;
        case 'tr':
            newWidth = startWidth + dx;
            newHeight = startHeight - dy;
            break;
        case 'bl':
            newWidth = startWidth - dx;
            newHeight = startHeight + dy;
            break;
        case 'tl':
            newWidth = startWidth - dx;
            newHeight = startHeight - dy;
            break;
        }
        newWidth = Math.min(newWidth, 1000);
        newHeight = Math.min(newHeight, 1000);
        // Без ограничения по соотношению
        if (newWidth > 10) {
        selectedMedia.style.width = `${newWidth}px`;

        setMediaWidth(newWidth);
        }
        if (newHeight > 10) {
            selectedMedia.style.height = `${newHeight}px`;
        setMediaHeight(newHeight);
        }
        handleInput();
    };

    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    };

    const renderHandles = () => {
        if (!selectedMedia) return null;

        return (
        <Box
            sx={{
            position: 'absolute',
            top: selectedMedia.offsetTop - 2,
            left: selectedMedia.offsetLeft - 2,
            width: selectedMedia.offsetWidth + 4,
            height: selectedMedia.offsetHeight + 4,
            border: '2px dashed #1976d2',
            pointerEvents: 'none',
            }}
        >
            {['tl', 'tr', 'bl', 'br'].map((corner) => {
            const positions = {
                tl: { top: -5, left: -5 },
                tr: { top: -5, right: -5 },
                bl: { bottom: -5, left: -5 },
                br: { bottom: -5, right: -5 },
            };
            return (
                <Box
                key={corner}
                sx={{
                    width: 10,
                    height: 10,
                    backgroundColor: '#1976d2',
                    position: 'absolute',
                    cursor: `${corner}-resize`,
                    ...positions[corner],
                    pointerEvents: 'all',
                }}
                onMouseDown={(e) => startDrag(e, corner)}
                />
            );
            })}
        </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
        {/* Панель кнопок */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={() => handleCommand('bold')}>B</Button>
            <Button variant="outlined" onClick={() => handleCommand('italic')}>I</Button>
            <Button variant="outlined" onClick={() => handleCommand('underline')}>U</Button>
            <Button variant="outlined" onClick={() => { saveSelection(); setLinkDialogOpen(true); }}>🔗 Link</Button>
            <Button variant="outlined" onClick={() => { saveSelection(); setImageDialogOpen(true); }}>🖼️ Img</Button>
            <Button variant="outlined" onClick={() => { saveSelection(); setVideoDialogOpen(true); }}>🎬 Video</Button>
            <Button variant="outlined" onClick={() => { saveSelection(); setColorDialogOpen(true); }}>🎨 Color</Button>
            <Button variant="outlined" onClick={() => { saveSelection(); setFontSizeDialogOpen(true); }}>🔠 Font Size</Button>
        </Stack>

        {/* Редактор */}
        <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onClick={handleMediaClick}
            sx={{
            minHeight: 250,
            border: '1px solid #ccc',
            padding: 2,
            borderRadius: 1,
            outline: 'none',
            fontSize: 16,
            whiteSpace: 'pre-wrap',
            position: 'relative',
            }}
        />

        {/* Drag Handles */}
        {renderHandles()}

        {/* Панель размеров медиа */}
        {selectedMedia && (
    <Box sx={{ mt: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
        <Typography variant="subtitle1">Изменение размеров выделенного медиа</Typography>
        <Typography>Ширина: {mediaWidth}px</Typography>
        <Slider
            value={mediaWidth}
            min={10}
            max={1000}
            onChange={(e, val) => handleWidthChange(val)}
            valueLabelDisplay="auto"
        />
        <Typography>Высота: {mediaHeight}px</Typography>
        <Slider
            value={mediaHeight}
            min={10}
            max={1000}
            onChange={(e, val) => handleHeightChange(val)}
            valueLabelDisplay="auto"
        />
    </Box>
)}

        {/* Диалог — ссылка */}
        <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
            <DialogTitle>Введите URL ссылки</DialogTitle>
            <DialogContent>
            <TextField
                autoFocus
                label="https://example.com"
                fullWidth
                variant="standard"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setLinkDialogOpen(false)}>Отмена</Button>
            <Button onClick={applyLink} disabled={!url}>Добавить</Button>
            </DialogActions>
        </Dialog>

        {/* Диалог — изображение */}
        <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
            <DialogTitle>Добавить изображение</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                autoFocus
                label="https://example.com/image.jpg"
                fullWidth
                variant="standard"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <Button variant="outlined" component="label">
                📁 Загрузить файл
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
            </Button>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setImageDialogOpen(false)}>Отмена</Button>
            <Button onClick={applyImage} disabled={!url}>Добавить по URL</Button>
            </DialogActions>
        </Dialog>

        {/* Диалог — видео */}
        <Dialog open={videoDialogOpen} onClose={() => setVideoDialogOpen(false)}>
            <DialogTitle>Добавить видео</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                autoFocus
                label="https://example.com/video.mp4"
                fullWidth
                variant="standard"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <Button variant="outlined" component="label">
                📁 Загрузить файл
                <input type="file" hidden accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
            </Button>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setVideoDialogOpen(false)}>Отмена</Button>
            <Button onClick={applyVideo} disabled={!url}>Добавить по URL</Button>
            </DialogActions>
        </Dialog>

        {/* Диалог — размер шрифта */}
        <Dialog open={fontSizeDialogOpen} onClose={() => setFontSizeDialogOpen(false)}>
            <DialogTitle>Выберите размер текста</DialogTitle>
            <DialogContent>
            <Box sx={{ width: 250, px: 2 }}>
                <Slider
                value={fontSize}
                onChange={(e, val) => setFontSize(val)}
                min={8}
                max={72}
                valueLabelDisplay="auto"
                />
                <Typography variant="body2">Текущий размер: {fontSize}px</Typography>
            </Box>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setFontSizeDialogOpen(false)}>Отмена</Button>
            <Button onClick={applyFontSize}>Применить</Button>
            </DialogActions>
        </Dialog>

        {/* Диалог — выбор цвета */}
        <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)}>
            <DialogTitle>Выберите цвет текста</DialogTitle>
            <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 1 }}>
                <HexColorPicker color={color} onChange={setColor} />
                <TextField
                label="HEX"
                variant="outlined"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                sx={{ width: 150 }}
                />
                <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '1px solid #ccc',
                }}
                />
            </Box>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setColorDialogOpen(false)}>Отмена</Button>
            <Button onClick={applyColor}>Применить</Button>
            </DialogActions>
        </Dialog>
        </Box>
    );
    };

    export default HtmlEditor;
