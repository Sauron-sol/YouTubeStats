'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, BarChart } from '@tremor/react';
import { FaChevronDown, FaChevronUp, FaYoutube } from 'react-icons/fa';
import { getMoreVideosStats, type YouTubeVideoStats } from '../services/youtube';

interface LatestVideosStatsProps {
  videos: YouTubeVideoStats[];
  channelId: string;
}

const LatestVideosStats = ({ videos: initialVideos, channelId }: LatestVideosStatsProps) => {
  const router = useRouter();
  const [allVideos, setAllVideos] = useState<YouTubeVideoStats[]>(initialVideos);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chartdata = initialVideos.map(video => ({
    name: video.title.length > 30 ? `${video.title.substring(0, 30)}...` : video.title,
    "Nombre de vues": parseInt(video.viewCount),
  }));

  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await getMoreVideosStats(channelId, nextPageToken);
      
      // Filtrer les vidéos déjà présentes
      const existingVideoIds = new Set(allVideos.map(v => v.id));
      const newVideos = result.videos.filter(video => !existingVideoIds.has(video.id));
      
      setAllVideos(prevVideos => [...prevVideos, ...newVideos]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des vidéos');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleShowAllVideos = () => {
    if (!showAllVideos && allVideos.length <= initialVideos.length) {
      handleLoadMore();
    }
    setShowAllVideos(!showAllVideos);
  };

  const displayedVideos = showAllVideos ? allVideos : initialVideos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white dark:bg-youtube-dark mt-6">
        <div className="flex items-center justify-between mb-4">
          <Title className="text-youtube-dark dark:text-white">
            {showAllVideos ? 'Toutes les vidéos' : 'Vues des 3 dernières vidéos'}
          </Title>
          <Link
            href={`/channel/${channelId}/videos`}
            className="flex items-center gap-2 px-4 py-2 bg-youtube-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaYoutube />
            <span>Voir toutes les vidéos</span>
          </Link>
        </div>
        
        {!showAllVideos && (
          <BarChart
            className="mt-6 h-72"
            data={chartdata}
            index="name"
            categories={["Nombre de vues"]}
            colors={["red"]}
            valueFormatter={(value) => 
              new Intl.NumberFormat('fr-FR').format(value)
            }
            yAxisWidth={100}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <AnimatePresence mode="popLayout">
            {displayedVideos.map((video, index) => (
              <motion.div
                key={`${video.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="bg-gray-50 dark:bg-youtube-darker card-hover cursor-pointer"
                  onClick={() => handleVideoClick(video.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleVideoClick(video.id)}
                  aria-label={`Voir les détails de la vidéo ${video.title}`}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
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

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <motion.button
          onClick={toggleShowAllVideos}
          className="mt-6 w-full py-3 px-4 bg-gray-100 dark:bg-youtube-darker rounded-lg 
                   text-youtube-gray hover:text-youtube-red transition-colors
                   flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showAllVideos ? (
            <>
              <FaChevronUp />
              <span>Voir moins</span>
            </>
          ) : (
            <>
              <FaChevronDown />
              <span>Voir plus de vidéos</span>
            </>
          )}
        </motion.button>

        {isLoadingMore && (
          <div className="mt-4 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-youtube-red border-t-transparent rounded-full"
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default LatestVideosStats; 