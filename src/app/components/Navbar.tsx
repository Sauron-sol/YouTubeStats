'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaYoutube, FaHistory, FaStar } from 'react-icons/fa';

const Navbar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Accueil', href: '/', icon: FaHome },
    { name: 'Historique', href: '/history', icon: FaHistory },
    { name: 'Favoris', href: '/favorites', icon: FaStar },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-youtube-dark shadow-md z-50">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/"
            className="flex items-center gap-2 text-youtube-red hover:text-red-700 transition-colors"
          >
            <FaYoutube className="text-3xl" />
            <span className="font-bold text-lg">YouTube Stats</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? 'bg-youtube-red text-white'
                      : 'text-youtube-dark dark:text-white hover:bg-gray-100 dark:hover:bg-youtube-darker'
                  }`}
                >
                  <item.icon className={`text-lg ${isActive ? 'text-white' : 'text-youtube-red'}`} />
                  <span className="hidden sm:block">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 