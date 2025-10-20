import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import type { User } from '../types';

interface CampusUser extends User {
  isFavorite?: boolean;
}

const Peers = () => {
  const { currentUser } = useUser();
  const { theme } = useTheme();
  const [campusUsers, setCampusUsers] = useState<CampusUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  useEffect(() => {
    if (currentUser) {
      loadCampusUsers();
    }
  }, [currentUser]);

  const loadCampusUsers = async () => {
    try {
      setLoading(true);
      // Swap in new realtime endpoint
      const response = await fetch(`/api/peers/active?campus=heilbronn`);
      if (!response.ok) {
        throw new Error('Failed to fetch campus users');
      }
      const data = await response.json();
      // Map to your CampusUser type shape if needed
      let users = (data.peers || []).map((p: any) => ({
        id: 0, // not provided by endpoint
        login: p.login,
        name: p.login,
        level: 0,
        campus: 'Heilbronn',
        location: p.host,
        favorites: [],
        begin_at: p.begin_at,
      }));
      // Remove current user and enrich with favorites as before
      users = users.filter((u: any) => u.login !== currentUser?.login);

      // Load favorites status for each user
      if (currentUser) {
        const usersWithFavorites = await Promise.all(
          users.map(async (user: User) => {
            try {
              const favResponse = await fetch(
                `/api/favorites/${currentUser.id}/is-favorite/${user.id}`
              );
              const favData = await favResponse.json();
              return {
                ...user,
                isFavorite: favData.data?.isFavorite || false
              };
            } catch (err) {
              return { ...user, isFavorite: false };
            }
          })
        );
        setCampusUsers(usersWithFavorites);
      } else {
        setCampusUsers(users);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load campus users');
      console.error('Error loading campus users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (user: CampusUser) => {
    if (!currentUser) return;

    try {
      if (user.isFavorite) {
        // Remove favorite
        const response = await fetch(
          `/api/favorites/${currentUser.id}/${user.id}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('Failed to remove favorite');
        }
      } else {
        // Add favorite
        const response = await fetch(
          `/api/favorites/${currentUser.id}/${user.id}`,
          { method: 'POST' }
        );

        if (!response.ok) {
          throw new Error('Failed to add favorite');
        }
      }

      // Update local state
      setCampusUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? { ...u, isFavorite: !u.isFavorite }
            : u
        )
      );
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      // You could show a toast notification here
    }
  };

  const filteredUsers = campusUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.login.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showOnlyFavorites || user.isFavorite;
    return matchesSearch && matchesFilter;
  });

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Peers
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
            Connect with students who are currently logged in at 42 Heilbronn
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search students by name or login..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  showOnlyFavorites
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {showOnlyFavorites ? '★ Favorites Only' : '☆ Show Favorites'}
              </button>
              <button
                onClick={loadCampusUsers}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  '🔄'
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
            <span className={`text-lg ${theme.text.primary}`}>Loading campus users...</span>
          </div>
        )}

        {/* Users Grid */}
        {!loading && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className={`text-sm ${theme.text.secondary}`}>
                Showing {filteredUsers.length} of {campusUsers.length} students
                {showOnlyFavorites && ' (favorites only)'}
              </p>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  {campusUsers.length === 0 ? (
                    <>No students are currently logged in at Heilbronn</>
                  ) : searchTerm ? (
                    <>No students match your search</>
                  ) : (
                    <>No favorite students yet</>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    hover={true}
                    className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative"
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(user)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                        user.isFavorite
                          ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={user.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg className="w-6 h-6" fill={user.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${theme.text.primary}`}>{user.name}</h3>
                        <p className={`text-sm ${theme.text.secondary}`}>@{user.login}</p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className={`text-sm font-medium ${theme.text.primary}`}>Level:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{user.level}</span>
                      </div>

                      {user.location && (
                        <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className={`text-sm font-medium ${theme.text.primary}`}>Location:</span>
                          <span className={`text-sm ${theme.text.secondary}`}>{user.location}</span>
                        </div>
                      )}

                      {user.favorites && user.favorites.length > 0 && (
                        <div className="pt-2">
                          <p className={`text-xs ${theme.text.secondary} mb-2`}>Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.favorites.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {user.favorites.length > 3 && (
                              <span className={`text-xs ${theme.text.secondary}`}>
                                +{user.favorites.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Peers;
