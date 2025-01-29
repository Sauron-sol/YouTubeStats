import { motion } from 'framer-motion';
import { FaYoutube } from 'react-icons/fa';

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-youtube-dark text-white py-6 mb-8 shadow-lg"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-2">
          <FaYoutube className="text-youtube-red text-4xl" />
          <h1 className="text-2xl md:text-3xl font-bold">
            YouTube Analytics
          </h1>
        </div>
        <p className="text-center mt-2 text-youtube-gray text-sm md:text-base">
          Analysez les statistiques de n'importe quelle chaîne YouTube
        </p>
      </div>
    </motion.header>
  );
};

export default Header; 