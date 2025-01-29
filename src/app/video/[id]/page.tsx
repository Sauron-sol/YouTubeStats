'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric } from '@tremor/react';
import { FaThumbsUp, FaComment, FaEye, FaCalendar, FaTags, FaUser, FaClock, FaReply } from 'react-icons/fa';
import { getVideoDetails, getVideoComments, type YouTubeVideoDetails, type YouTubeComment } from '@/app/services/youtube';

const decodeHtmlEntities = (text: string) => {
  // Remplacer les balises <br> par des retours à la ligne
  const withLineBreaks = text.replace(/<br\s*\/?>/gi, '\n');
  // Supprimer toutes les autres balises HTML
  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, '');
  // Décoder les entités HTML
  const textarea = document.createElement('textarea');
  textarea.innerHTML = withoutTags;
  return textarea.value;
};

const sanitizeProfileImage = (url: string) => {
  // Vérifier si l'URL est vide ou ne commence pas par https
  if (!url || !url.startsWith('https://')) {
    return 'https://www.youtube.com/img/desktop/unavailable/unavailable_profile_48.png';
  }
  return url;
};

export default function VideoPage() {
  const { id } = useParams();
  const [videoDetails, setVideoDetails] = useState<YouTubeVideoDetails | null>(null);
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [details, videoComments] = await Promise.all([
          getVideoDetails(id as string),
          getVideoComments(id as string)
        ]);
        setVideoDetails(details);
        setComments(videoComments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-youtube-darker p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <Text className="text-red-700 dark:text-red-400">{error}</Text>
          </Card>
        </div>
      </div>
    );
  }

  if (!videoDetails) return null;

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match?.[1] || '').replace('H', '');
    const minutes = (match?.[2] || '').replace('M', '');
    const seconds = (match?.[3] || '').replace('S', '');
    
    const parts = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-youtube-dark mb-6">
                {/* Lecteur vidéo */}
                <div className="aspect-video mb-6">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${videoDetails.id}?autoplay=0&rel=0&modestbranding=1&disablekb=1&fs=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`}
                    title={videoDetails.title}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                    loading="lazy"
                  />
                </div>

                {/* Informations de la vidéo */}
                <div className="space-y-6">
                  {/* Titre et chaîne */}
                  <div>
                    <Title className="text-2xl text-youtube-dark dark:text-white mb-2">
                      {videoDetails.title}
                    </Title>
                    <Text className="text-youtube-gray flex items-center gap-2">
                      <FaUser className="inline" />
                      {videoDetails.channelTitle}
                    </Text>
                  </div>

                  {/* Statistiques principales */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-50 dark:bg-youtube-darker">
                      <div className="flex items-center gap-2 mb-2">
                        <FaEye className="text-youtube-red" />
                        <Text className="text-youtube-gray">Vues</Text>
                      </div>
                      <Metric className="text-youtube-dark dark:text-white">
                        {new Intl.NumberFormat('fr-FR').format(parseInt(videoDetails.viewCount))}
                      </Metric>
                    </Card>

                    <Card className="bg-gray-50 dark:bg-youtube-darker">
                      <div className="flex items-center gap-2 mb-2">
                        <FaThumbsUp className="text-youtube-red" />
                        <Text className="text-youtube-gray">J'aime</Text>
                      </div>
                      <Metric className="text-youtube-dark dark:text-white">
                        {new Intl.NumberFormat('fr-FR').format(parseInt(videoDetails.likeCount))}
                      </Metric>
                    </Card>

                    <Card className="bg-gray-50 dark:bg-youtube-darker">
                      <div className="flex items-center gap-2 mb-2">
                        <FaComment className="text-youtube-red" />
                        <Text className="text-youtube-gray">Commentaires</Text>
                      </div>
                      <Metric className="text-youtube-dark dark:text-white">
                        {new Intl.NumberFormat('fr-FR').format(parseInt(videoDetails.commentCount))}
                      </Metric>
                    </Card>

                    <Card className="bg-gray-50 dark:bg-youtube-darker">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-youtube-red" />
                        <Text className="text-youtube-gray">Durée</Text>
                      </div>
                      <Metric className="text-youtube-dark dark:text-white">
                        {formatDuration(videoDetails.duration)}
                      </Metric>
                    </Card>
                  </div>

                  {/* Date de publication */}
                  <Card className="bg-gray-50 dark:bg-youtube-darker">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendar className="text-youtube-red" />
                      <Text className="text-youtube-gray">Date de publication</Text>
                    </div>
                    <Text className="text-youtube-dark dark:text-white">
                      {formatDate(videoDetails.publishedAt)}
                    </Text>
                  </Card>

                  {/* Tags */}
                  {videoDetails.tags.length > 0 && (
                    <Card className="bg-gray-50 dark:bg-youtube-darker">
                      <div className="flex items-center gap-2 mb-4">
                        <FaTags className="text-youtube-red" />
                        <Text className="text-youtube-gray">Tags</Text>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {videoDetails.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-youtube-red bg-opacity-10 text-youtube-red rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Description */}
                  <Card className="bg-gray-50 dark:bg-youtube-darker">
                    <Title className="text-youtube-dark dark:text-white mb-4">
                      Description
                    </Title>
                    <Text className="text-youtube-gray whitespace-pre-wrap">
                      {videoDetails.description}
                    </Text>
                  </Card>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Colonne des commentaires */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white dark:bg-youtube-dark sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <Title className="text-youtube-dark dark:text-white flex items-center gap-2">
                    <FaComment className="text-youtube-red" />
                    Commentaires ({new Intl.NumberFormat('fr-FR').format(comments.length)})
                  </Title>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((comment) => (
                    <Card 
                      key={comment.id}
                      className="bg-gray-50 dark:bg-youtube-darker transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={sanitizeProfileImage(comment.authorProfileImageUrl)}
                          alt={comment.authorDisplayName}
                          className="w-10 h-10 rounded-full object-cover bg-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://www.youtube.com/img/desktop/unavailable/unavailable_profile_48.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Text className="font-medium text-youtube-dark dark:text-white">
                              {decodeHtmlEntities(comment.authorDisplayName)}
                            </Text>
                            <Text className="text-sm text-youtube-gray">
                              {formatTimeAgo(comment.publishedAt)}
                            </Text>
                          </div>
                          <Text className="text-youtube-dark dark:text-white break-words whitespace-pre-wrap">
                            {decodeHtmlEntities(comment.textDisplay)}
                          </Text>
                          <div className="flex items-center gap-4 mt-2 text-sm text-youtube-gray">
                            <span className="flex items-center gap-1">
                              <FaThumbsUp className="text-youtube-red" />
                              {new Intl.NumberFormat('fr-FR').format(comment.likeCount)}
                            </span>
                            {comment.totalReplyCount > 0 && (
                              <span className="flex items-center gap-1">
                                <FaReply className="text-youtube-red" />
                                {comment.totalReplyCount === 1 
                                  ? '1 réponse'
                                  : `${new Intl.NumberFormat('fr-FR').format(comment.totalReplyCount)} réponses`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 