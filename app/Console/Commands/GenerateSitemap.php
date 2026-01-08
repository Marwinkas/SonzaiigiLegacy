<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Card;
use App\Models\User;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate the sitemap.xml file';

    public function handle()
    {
        $baseUrl = 'https://sonzaiigi.art';

        $sitemap = Sitemap::create()
            ->add(Url::create("{$baseUrl}/dashboard"));

        foreach (Card::all() as $post) {
            $sitemap->add(
                Url::create("{$baseUrl}/dashboard/{$post->id}")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.8)
            );
        }

        foreach (User::all() as $post) {
            $sitemap->add(
                Url::create("{$baseUrl}/profile/{$post->id}")
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    ->setPriority(0.9)
            );
        }

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->info('sitemap.xml создан!');
    }
}
