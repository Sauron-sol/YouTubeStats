'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@tremor/react';
import { FaSearch, FaStar } from 'react-icons/fa';
import Header from './components/Header';
import ChannelStats from './components/ChannelStats';
import LatestVideosStats from './components/LatestVideosStats';
import { 
  getChannelStats, 
  getLatestVideosStats, 
  type YouTubeChannelStats,
  type YouTubeVideoStats 
} from './services/youtube';
import { storageService } from './services/storage';
import { useSearchParams } from 'next/navigation';

// Composant qui utilise useSearchParams
function SearchParamsComponent() {
  const searchParams = useSearchParams();
  const [channelId, setChannelId] = useState<string>(searchParams.get('channelId') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<YouTubeChannelStats | null>(null);
  const [videoStats, setVideoStats] = useState<YouTubeVideoStats[] | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (searchParams.get('channelId')) {
      setChannelId(searchParams.get('channelId') || '');
      handleSearch(searchParams.get('channelId') || '');
    }
  }, [searchParams]);

  useEffect(() => {
    if (stats) {
      setIsFavorite(storageService.isInFavorites(channelId));
    }
  }, [stats, channelId]);

  const handleSearch = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const channelStats = await getChannelStats(id);
      setStats(channelStats);
      
      const videos = await getLatestVideosStats(id);
      setVideoStats(videos);

      // Ajouter à l'historique
      if (channelStats) {
        storageService.addToHistory({
          id: channelStats.id,
          title: channelStats.title,
          thumbnailUrl: channelStats.thumbnails.medium.url,
          subscriberCount: channelStats.subscriberCount,
          viewCount: channelStats.viewCount,
          videoCount: channelStats.videoCount,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setStats(null);
      setVideoStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(channelId);
  };

  const handleToggleFavorite = () => {
    if (!stats) return;

    if (isFavorite) {
      storageService.removeFromFavorites(channelId);
    } else {
      storageService.addToFavorites({
        id: channelId,
        title: stats.title,
        thumbnailUrl: stats.thumbnails.medium.url,
        subscriberCount: stats.subscriberCount,
        viewCount: stats.viewCount,
        videoCount: stats.videoCount,
        timestamp: new Date().toISOString()
      });
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-youtube-dark p-6">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(channelId);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="channelId" className="block text-sm font-medium text-youtube-dark dark:text-white mb-2">
              ID de la chaîne YouTube
            </label>
            <input
              type="text"
              id="channelId"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Exemple: UCX6OQ3DkcsbYNE6H8uQQuVA"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-youtube-darker text-youtube-dark dark:text-white
                       focus:ring-2 focus:ring-youtube-red focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-youtube-red text-white py-2 px-4 rounded-lg
                     hover:bg-red-700 transition-colors
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Chargement...' : 'Analyser'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
      </Card>

      {stats && (
        <div className="relative">
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'text-youtube-red hover:text-red-700' 
                : 'text-youtube-gray hover:text-youtube-red'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <FaStar className="text-2xl" />
          </button>
          <ChannelStats stats={stats} />
        </div>
      )}
      {videoStats && videoStats.length > 0 && (
        <LatestVideosStats videos={videoStats} channelId={channelId} />
      )}
    </div>
  );
}

// Page principale avec Suspense
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-youtube-darker">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-youtube-red"></div>
          </div>
        }>
          <SearchParamsComponent />
        </Suspense>
      </main>
    </div>
  );
} 