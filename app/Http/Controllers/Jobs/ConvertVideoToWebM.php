<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ConvertVideoToWebM implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $originalFullPath;
    protected string $convertedFullPath;
    protected string $thumbnailPath;
    protected string $folderName;
    protected string $fileId;

    public function __construct(string $originalFullPath, string $convertedFullPath, string $thumbnailPath, string $folderName, string $fileId)
    {
        $this->originalFullPath = $originalFullPath;
        $this->convertedFullPath = $convertedFullPath;
        $this->thumbnailPath = $thumbnailPath;
        $this->folderName = $folderName;
        $this->fileId = $fileId;
    }

    public function handle()
    {
        // Конвертация в WebM
        $command = "ffmpeg -i " . escapeshellarg($this->originalFullPath) .
                   " -b:v 3000k -c:v libvpx -c:a libvorbis " . escapeshellarg($this->convertedFullPath);
        exec($command, $output, $returnVar);

        if ($returnVar === 0 && file_exists($this->convertedFullPath)) {
            // Генерация превью
            $command = "ffmpeg -i " . escapeshellarg($this->convertedFullPath) .
                       " -ss 00:00:01.000 -vframes 1 " . escapeshellarg($this->thumbnailPath);
            exec($command);
        }

        // Удаление оригинального файла можно включить по желанию
        // unlink($this->originalFullPath);
    }
}
