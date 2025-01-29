import { Card, Text, Metric, Grid } from '@tremor/react';
import { motion } from 'framer-motion';
import { FaUsers, FaEye, FaVideo } from 'react-icons/fa';
import type { YouTubeChannelStats } from '../services/youtube';

interface ChannelStatsProps {
  stats: YouTubeChannelStats;
}

const formatNumber = (num: string) => {
  return new Intl.NumberFormat('fr-FR').format(parseInt(num));
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: any }) => (
  <Card className="bg-white dark:bg-youtube-dark p-6 shadow-custom hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <Text className="text-youtube-gray mb-2">{title}</Text>
        <Metric className="text-youtube-dark dark:text-white">{value}</Metric>
      </div>
      <Icon className="text-4xl text-youtube-red opacity-80" />
    </div>
  </Card>
);

const ChannelStats = ({ stats }: ChannelStatsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <motion.div 
        className="bg-white dark:bg-youtube-dark rounded-xl p-6 shadow-custom"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <motion.img
            src={stats.thumbnails.medium.url}
            alt={stats.title}
            className="rounded-full w-32 h-32 object-cover ring-4 ring-youtube-red"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold text-youtube-dark dark:text-white mb-2">
              {stats.title}
            </h2>
            {stats.customUrl && (
              <a
                href={`https://youtube.com/${stats.customUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-youtube-red hover:text-red-600 font-medium inline-block mb-2"
              >
                @{stats.customUrl.replace('@', '')}
              </a>
            )}
            <div className="space-y-1 text-youtube-gray">
              <p>Créée le {formatDate(stats.publishedAt)}</p>
              {stats.country && <p>Pays : {stats.country}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        <StatCard 
          title="Abonnés"
          value={formatNumber(stats.subscriberCount)}
          icon={FaUsers}
        />
        <StatCard 
          title="Vues totales"
          value={formatNumber(stats.viewCount)}
          icon={FaEye}
        />
        <StatCard 
          title="Vidéos publiées"
          value={formatNumber(stats.videoCount)}
          icon={FaVideo}
        />
      </Grid>

      <Card className="bg-white dark:bg-youtube-dark p-6 shadow-custom">
        <Text className="text-youtube-gray mb-4 font-medium">Description</Text>
        <p className="text-youtube-dark dark:text-white whitespace-pre-wrap">
          {stats.description}
        </p>
      </Card>
    </motion.div>
  );
};

export default ChannelStats; 