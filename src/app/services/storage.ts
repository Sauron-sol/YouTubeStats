export interface StoredChannel {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  timestamp: string;
}

class StorageService {
  private readonly HISTORY_KEY = 'youtube-stats-history';
  private readonly FAVORITES_KEY = 'youtube-stats-favorites';
  private readonly LAST_CHANNEL_KEY = 'youtube-stats-last-channel';
  private readonly MAX_HISTORY_ITEMS = 50;

  // Historique
  getHistory(): StoredChannel[] {
    if (typeof window === 'undefined') return [];
    const history = localStorage.getItem(this.HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  addToHistory(channel: StoredChannel) {
    if (typeof window === 'undefined') return;
    const history = this.getHistory();
    
    // Supprimer les doublons
    const filteredHistory = history.filter(item => item.id !== channel.id);
    
    // Ajouter le nouveau canal au début
    const newHistory = [
      { ...channel, timestamp: new Date().toISOString() },
      ...filteredHistory
    ].slice(0, this.MAX_HISTORY_ITEMS);

    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(newHistory));
  }

  clearHistory() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify([]));
  }

  // Favoris
  getFavorites(): StoredChannel[] {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem(this.FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  }

  addToFavorites(channel: StoredChannel) {
    if (typeof window === 'undefined') return;
    const favorites = this.getFavorites();
    
    // Vérifier si le canal est déjà dans les favoris
    if (!favorites.some(item => item.id === channel.id)) {
      const newFavorites = [
        { ...channel, timestamp: new Date().toISOString() },
        ...favorites
      ];
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(newFavorites));
    }
  }

  removeFromFavorites(channelId: string) {
    if (typeof window === 'undefined') return;
    const favorites = this.getFavorites();
    const newFavorites = favorites.filter(item => item.id !== channelId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(newFavorites));
  }

  isInFavorites(channelId: string): boolean {
    if (typeof window === 'undefined') return false;
    const favorites = this.getFavorites();
    return favorites.some(item => item.id === channelId);
  }

  // Gestion de la dernière chaîne consultée
  getLastChannel(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.LAST_CHANNEL_KEY);
  }

  setLastChannel(channelId: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.LAST_CHANNEL_KEY, channelId);
  }

  clearLastChannel() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.LAST_CHANNEL_KEY);
  }
}

export const storageService = new StorageService(); 