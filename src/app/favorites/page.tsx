'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text } from '@tremor/react';
import { FaEye, FaUsers, FaVideo, FaStar } from 'react-icons/fa';
import Link from 'next/link';
import { storageService, type StoredChannel } from '../services/storage';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<StoredChannel[]>([]);

  useEffect(() => {
    setFavorites(storageService.getFavorites());
  }, []);

  const handleRemoveFromFavorites = (e: React.MouseEvent, channelId: string) => {
    e.preventDefault();
    storageService.removeFromFavorites(channelId);
    setFavorites(storageService.getFavorites());
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-youtube-darker p-8">
      <div className="max-w-7xl mx-auto">
        <Title className="text-youtube-dark dark:text-white mb-6">
          Chaînes favorites
        </Title>

        {favorites.length === 0 ? (
          <Card className="bg-white dark:bg-youtube-dark">
            <Text className="text-youtube-gray text-center py-8">
              Aucune chaîne favorite
            </Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/?channelId=${channel.id}`}>
                  <Card className="bg-white dark:bg-youtube-dark hover:shadow-lg transition-all cursor-pointer relative">
                    <button
                      onClick={(e) => handleRemoveFromFavorites(e, channel.id)}
                      className="absolute top-2 right-2 p-2 text-youtube-red hover:text-red-700 transition-colors"
                      title="Retirer des favoris"
                    >
                      <FaStar className="text-xl" />
                    </button>

                    <div className="flex items-start gap-4">
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.title}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Title className="text-youtube-dark dark:text-white text-lg mb-2 truncate">
                          {channel.title}
                        </Title>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-youtube-gray">
                            <FaUsers className="text-youtube-red" />
                            <span>{new Intl.NumberFormat('fr-FR').format(parseInt(channel.subscriberCount))}</span>
                          </div>
                          <div className="flex items-center gap-1 text-youtube-gray">
                            <FaEye className="text-youtube-red" />
                            <span>{new Intl.NumberFormat('fr-FR').format(parseInt(channel.viewCount))}</span>
                          </div>
                          <div className="flex items-center gap-1 text-youtube-gray">
                            <FaVideo className="text-youtube-red" />
                            <span>{new Intl.NumberFormat('fr-FR').format(parseInt(channel.videoCount))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 