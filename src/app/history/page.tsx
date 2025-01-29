'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text } from '@tremor/react';
import { FaEye, FaUsers, FaVideo, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { storageService, type StoredChannel } from '../services/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState<StoredChannel[]>([]);

  useEffect(() => {
    setHistory(storageService.getHistory());
  }, []);

  const handleClearHistory = () => {
    storageService.clearHistory();
    setHistory([]);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    if (diffInSeconds < 31536000) return `Il y a ${Math.floor(diffInSeconds / 2592000)} mois`;
    return `Il y a ${Math.floor(diffInSeconds / 31536000)} ans`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-youtube-darker p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title className="text-youtube-dark dark:text-white">
            Historique des chaînes consultées
          </Title>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaTrash />
              <span>Effacer l'historique</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="bg-white dark:bg-youtube-dark">
            <Text className="text-youtube-gray text-center py-8">
              Aucun historique disponible
            </Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((channel, index) => (
              <motion.div
                key={`${channel.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/?channelId=${channel.id}`}>
                  <Card className="bg-white dark:bg-youtube-dark hover:shadow-lg transition-all cursor-pointer">
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
                        <Text className="text-youtube-gray text-sm mt-2">
                          {formatTimeAgo(channel.timestamp)}
                        </Text>
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