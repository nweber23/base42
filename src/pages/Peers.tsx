import { useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import Card from '../components/Card';
import type { User } from '../types';

interface PeerCardProps {
  peer: User;
  isFavorite: boolean;
  onToggleFavorite: (peerId: number) => void;
  isCurrentUser: boolean;
}

const PeerCard: React.FC<PeerCardProps> = ({ peer, isFavorite, onToggleFavorite, isCurrentUser }) => {
  const formatLastLogin = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const handleToggleFavorite = useCallback(() => {
    if (!isCurrentUser) {
      onToggleFavorite(peer.id);
    }
  }, [peer.id, onToggleFavorite, isCurrentUser]);

  return (
    <Card hover={true} className="transition-all duration-200 hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-blue-100 dark:ring-blue-900 transition-all duration-200">
            <span className="text-white font-semibold text-lg">
              {peer.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
              {peer.name}
              {isCurrentUser && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 transition-colors duration-300">
                  You
                </span>
              )}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Level {peer.level}</p>
          </div>
        </div>
        
        {!isCurrentUser && (
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isFavorite
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Current Project:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400 transition-colors duration-300">{peer.current_project.name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Campus:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{peer.campus}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Last Login:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">{formatLastLogin(peer.last_login)}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex flex-wrap gap-1">
          {peer.favorites.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-300 hover:scale-105"
            >
              {tech}
            </span>
          ))}
          {peer.favorites.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-300">
              +{peer.favorites.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

const Peers: React.FC = () => {
  const { currentUser, users } = useUser();
  const [localFavorites, setLocalFavorites] = useState<number[]>([]);

  const handleToggleFavorite = useCallback((peerId: number) => {
    setLocalFavorites(prev => {
      if (prev.includes(peerId)) {
        return prev.filter(id => id !== peerId);
      } else {
        return [...prev, peerId];
      }
    });
  }, []);

  const isFavorite = useCallback((peerId: number): boolean => {
    return localFavorites.includes(peerId);
  }, [localFavorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">Peers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
          Connect and collaborate with your fellow students at {currentUser.campus}
        </p>
        {localFavorites.length > 0 && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-300">
            You have {localFavorites.length} favorite peer{localFavorites.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <PeerCard
            key={user.id}
            peer={user}
            isFavorite={isFavorite(user.id)}
            onToggleFavorite={handleToggleFavorite}
            isCurrentUser={user.id === currentUser.id}
          />
        ))}
      </div>
      
      {localFavorites.length > 0 && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors duration-300">Your Favorite Peers</h3>
          <div className="flex flex-wrap gap-2">
            {users
              .filter(user => localFavorites.includes(user.id))
              .map(user => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 transition-all duration-300 hover:scale-105"
                >
                  {user.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Peers;