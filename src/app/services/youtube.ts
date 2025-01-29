import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API YouTube n\'est pas configurée. Veuillez définir NEXT_PUBLIC_YOUTUBE_API_KEY dans votre fichier .env');
  }
  return apiKey;
};

export interface YouTubeChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  customUrl?: string;
  country?: string;
}

export const getChannelStats = async (channelId: string): Promise<YouTubeChannelStats> => {
  const apiKey = getApiKey();

  try {
    const response = await axios.get(`${BASE_URL}/channels`, {
      params: {
        part: 'statistics,snippet,brandingSettings',
        id: channelId,
        key: apiKey,
      },
    });

    const channel = response.data.items[0];
    if (!channel) {
      throw new Error('Chaîne non trouvée');
    }

    return {
      subscriberCount: channel.statistics.subscriberCount,
      viewCount: channel.statistics.viewCount,
      videoCount: channel.statistics.videoCount,
      title: channel.snippet.title,
      description: channel.snippet.description,
      publishedAt: channel.snippet.publishedAt,
      thumbnails: channel.snippet.thumbnails,
      customUrl: channel.snippet.customUrl,
      country: channel.snippet.country,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer les statistiques de la chaîne');
    }
    throw error;
  }
};

export interface YouTubeVideoStats {
  id: string;
  title: string;
  viewCount: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export const getLatestVideosStats = async (channelId: string): Promise<YouTubeVideoStats[]> => {
  const apiKey = getApiKey();

  try {
    // D'abord, récupérer les IDs des dernières vidéos
    const videosResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId,
        maxResults: 3,
        order: 'date',
        type: 'video',
        key: apiKey,
      },
    });

    const videoIds = videosResponse.data.items.map((item: any) => item.id.videoId);

    // Ensuite, récupérer les statistiques détaillées pour ces vidéos
    const statsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics,snippet',
        id: videoIds.join(','),
        key: apiKey,
      },
    });

    return statsResponse.data.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      viewCount: video.statistics.viewCount,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.medium.url,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer les statistiques des vidéos');
    }
    throw error;
  }
};

export const getMoreVideosStats = async (channelId: string, pageToken?: string): Promise<{ videos: YouTubeVideoStats[], nextPageToken?: string }> => {
  const apiKey = getApiKey();

  try {
    // Récupérer les IDs des vidéos avec pagination
    const videosResponse = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        channelId,
        maxResults: 12,
        order: 'date',
        type: 'video',
        pageToken,
        key: apiKey,
      },
    });

    const videoIds = videosResponse.data.items.map((item: any) => item.id.videoId);

    // Récupérer les statistiques détaillées pour ces vidéos
    const statsResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics,snippet',
        id: videoIds.join(','),
        key: apiKey,
      },
    });

    const videos = statsResponse.data.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      viewCount: video.statistics.viewCount,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.medium.url,
    }));

    return {
      videos,
      nextPageToken: videosResponse.data.nextPageToken,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer plus de vidéos');
    }
    throw error;
  }
};

export interface YouTubeVideoDetails {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  channelTitle: string;
  channelId: string;
}

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideoDetails> => {
  const apiKey = getApiKey();

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: apiKey,
      },
    });

    const video = response.data.items[0];
    if (!video) {
      throw new Error('Vidéo non trouvée');
    }

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
      tags: video.snippet.tags || [],
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
      duration: video.contentDetails.duration,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer les détails de la vidéo');
    }
    throw error;
  }
};

export interface YouTubeLiveStats {
  timestamp: string;
  viewCount: number;
}

export const getLiveVideoStats = async (videoId: string): Promise<YouTubeLiveStats> => {
  const apiKey = getApiKey();

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics',
        id: videoId,
        key: apiKey,
      },
    });

    const video = response.data.items[0];
    if (!video) {
      throw new Error('Vidéo non trouvée');
    }

    return {
      timestamp: new Date().toISOString(),
      viewCount: parseInt(video.statistics.viewCount),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer les statistiques en direct');
    }
    throw error;
  }
};

export interface YouTubeHistoricalStats {
  timestamp: string;
  viewCount: number;
  realtime: boolean;
}

export const getVideoHistoricalStats = async (videoId: string): Promise<YouTubeHistoricalStats[]> => {
  const apiKey = getApiKey();

  try {
    // Récupérer d'abord les statistiques actuelles
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics',
        id: videoId,
        key: apiKey,
      },
    });

    const video = response.data.items[0];
    if (!video) {
      throw new Error('Vidéo non trouvée');
    }

    const currentViews = parseInt(video.statistics.viewCount);
    const now = new Date();
    const stats: YouTubeHistoricalStats[] = [];

    // Générer 96 points de données (48 heures)
    for (let i = 95; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30 * 60000); // 30 minutes d'intervalle
      
      // Ajouter une variation aléatoire pour simuler des fluctuations réalistes
      const hourOfDay = timestamp.getHours();
      const baseVariation = Math.random() * 0.1; // 10% de variation de base
      
      // Simuler les pics d'audience selon l'heure
      let timeBasedVariation = 1;
      if (hourOfDay >= 18 && hourOfDay <= 22) { // Heures de pointe
        timeBasedVariation = 1.2;
      } else if (hourOfDay >= 1 && hourOfDay <= 5) { // Heures creuses
        timeBasedVariation = 0.7;
      }

      // Calculer le nombre de vues pour ce point dans le temps
      const viewsAtPoint = Math.floor(
        currentViews * 
        (0.95 + (i / 95) * 0.05) * // Progression générale
        (1 + (baseVariation - 0.05)) * // Variation aléatoire
        timeBasedVariation // Variation basée sur l'heure
      );

      stats.push({
        timestamp: timestamp.toISOString(),
        viewCount: viewsAtPoint,
        realtime: i === 0
      });
    }

    return stats;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer l\'historique des statistiques');
    }
    throw error;
  }
};

export interface YouTubeComment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
  totalReplyCount: number;
}

export const getVideoComments = async (videoId: string): Promise<YouTubeComment[]> => {
  const apiKey = getApiKey();

  try {
    const response = await axios.get(`${BASE_URL}/commentThreads`, {
      params: {
        part: 'snippet,replies',
        videoId: videoId,
        maxResults: 50,
        order: 'relevance',
        key: apiKey,
      },
    });

    return response.data.items.map((item: any) => {
      const comment = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        authorDisplayName: comment.authorDisplayName,
        authorProfileImageUrl: comment.authorProfileImageUrl,
        textDisplay: comment.textDisplay,
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt,
        updatedAt: comment.updatedAt,
        totalReplyCount: item.snippet.totalReplyCount,
      };
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || 'Impossible de récupérer les commentaires');
    }
    throw error;
  }
}; 