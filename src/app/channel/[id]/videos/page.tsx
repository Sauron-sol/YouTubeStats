'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text } from '@tremor/react';
import { FaArrowLeft } from 'react-icons/fa';
import { getMoreVideosStats, type YouTubeVideoStats } from '@/app/services/youtube';

export default function ChannelVideosPage() {
  const { id } = useParams();
  const router = useRouter();
  const [videos, setVideos] = useState<YouTubeVideoStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const loadVideos = async (pageToken?: string) => {
    try {
      const result = await getMoreVideosStats(id as string, pageToken);
      
      if (pageToken) {
        setVideos(prev => [...prev, ...result.videos]);
      } else {
        setVideos(result.videos);
      }
      
      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des vidéos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [id]);

  // Fonction pour détecter quand on atteint le bas de la page
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        if (hasMore && !isLoading && nextPageToken) {
          loadVideos(nextPageToken);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, nextPageToken]);

  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-youtube-darker p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-youtube-red border-t-transparent rounded-full mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-youtube-darker p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-youtube-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaArrowLeft />
            <span>Retour</span>
          </button>
          <Title className="text-youtube-dark dark:text-white">
            Toutes les vidéos de la chaîne
          </Title>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                       text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {videos.map((video, index) => (
              <motion.div
                key={`${video.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white dark:bg-youtube-dark card-hover cursor-pointer"
                  onClick={() => handleVideoClick(video.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleVideoClick(video.id)}
                  aria-label={`Voir les détails de la vidéo ${video.title}`}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity rounded-lg" />
                  </div>
                  <Text className="font-medium text-youtube-dark dark:text-white line-clamp-2">
                    {video.title}
                  </Text>
                  <Text className="text-youtube-gray mt-2">
                    {new Intl.NumberFormat('fr-FR').format(parseInt(video.viewCount))} vues
                  </Text>
                  <Text className="text-youtube-gray text-sm mt-1">
                    {new Date(video.publishedAt).toLocaleDateString('fr-FR')}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {isLoading && (
          <div className="mt-8 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-youtube-red border-t-transparent rounded-full"
            />
          </div>
        )}

        {!hasMore && videos.length > 0 && (
          <Text className="text-center text-youtube-gray mt-8">
            Plus aucune vidéo à charger
          </Text>
        )}
      </div>
    </div>
  );
} 