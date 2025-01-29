import { useEffect, useState } from 'react';
import { Card, Title, AreaChart, Text } from '@tremor/react';
import { motion } from 'framer-motion';
import { getVideoHistoricalStats, type YouTubeHistoricalStats } from '../services/youtube';

interface LiveViewsChartProps {
  videoId: string;
}

const LiveViewsChart = ({ videoId }: LiveViewsChartProps) => {
  const [historicalStats, setHistoricalStats] = useState<YouTubeHistoricalStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchInterval = 5 * 60000; // 5 minutes

    const fetchStats = async () => {
      try {
        const stats = await getVideoHistoricalStats(videoId);
        setHistoricalStats(stats);
        setLastUpdate(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de récupération des statistiques');
      }
    };

    // Première récupération
    fetchStats();

    // Mettre en place l'intervalle de récupération
    const interval = setInterval(fetchStats, fetchInterval);

    // Nettoyer l'intervalle lors du démontage
    return () => clearInterval(interval);
  }, [videoId]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes === 1) return 'Il y a 1 minute';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return 'Il y a 1 heure';
    if (diffHours < 24) return `Il y a ${diffHours} heures`;
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartdata = historicalStats.map(stat => {
    const date = new Date(stat.timestamp);
    return {
      date: formatTimeAgo(date),
      "Vues": stat.viewCount,
      timestamp: stat.timestamp,
      realtime: stat.realtime
    };
  });

  // Calculer les variations
  const currentViews = historicalStats[historicalStats.length - 1]?.viewCount || 0;
  const previousViews = historicalStats[historicalStats.length - 2]?.viewCount || 0;
  const viewsChange = currentViews - previousViews;
  const percentChange = previousViews ? (viewsChange / previousViews) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white dark:bg-youtube-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title className="text-youtube-dark dark:text-white">
              Vues en temps réel
            </Title>
            <div className="flex items-center gap-2 mt-1">
              <Text className="text-youtube-gray text-sm">
                Dernières 48 heures
              </Text>
              {viewsChange !== 0 && (
                <Text className={`text-sm ${viewsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {viewsChange > 0 ? '+' : ''}{viewsChange} vues
                  ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(2)}%)
                </Text>
              )}
            </div>
          </div>
          {lastUpdate && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              <Text className="text-sm text-youtube-gray">
                Dernière mise à jour : {formatTimeAgo(lastUpdate)}
              </Text>
            </motion.div>
          )}
        </div>

        {error ? (
          <div className="text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <AreaChart
            className="h-72 mt-4"
            data={chartdata}
            index="date"
            categories={["Vues"]}
            colors={["red"]}
            valueFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value)}
            showAnimation={true}
            showLegend={false}
            showGridLines={true}
            curveType="natural"
            minValue={0}
            showXAxis={true}
            showYAxis={true}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default LiveViewsChart; 