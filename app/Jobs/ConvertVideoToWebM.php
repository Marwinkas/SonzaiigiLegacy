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
           " -c:v libsvtav1 -preset 10 -pix_fmt yuv420p10le -crf 24 -svtav1-params tune=0:irefresh-type=1 " .
           "-c:a libopus -b:a 160k " .
           escapeshellarg($this->convertedFullPath . "_1080p.webm");
        exec($command, $output, $returnVar);

        unlink($this->originalFullPath);
    }
}
