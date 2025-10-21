import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import Card from '../components/Card';

interface UserProject {
  id: number;
  name: string;
  description: string;
  difficulty_level: string;
  category: string;
  completion_percentage: number;
  deadline: string | null;
  started_at: string;
  status: string;
  notes: string | null;
  final_mark?: number;
  validated?: boolean;
}

const Dashboard = () => {
  const { currentUser, refreshUserData } = useUser();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('');
  const [displayLocation, setDisplayLocation] = useState<string>('');
  const [editingFavorites, setEditingFavorites] = useState(false);
  const [favoriteInput, setFavoriteInput] = useState('');
  const [favoritesDraft, setFavoritesDraft] = useState<string[]>([]);
  const [savingFavorites, setSavingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');

  // Load user's active project from the backend
  useEffect(() => {
    const loadProjects = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch(`/api/projects/user/${currentUser.id}/active`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data.data ? [data.data] : []);
        } else {
          console.error('Failed to load active project:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading active project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [currentUser]);

  // Initialize and resolve location display
  useEffect(() => {
    const resolveLocation = async () => {
      if (!currentUser) return;
      const base = currentUser.location || '';
      setDisplayLocation(base);
      if (!base) {
        try {
          const resp = await fetch(`/api/peers/active?campus=heilbronn`);
          if (resp.ok) {
            const data = await resp.json();
            const me = (data.peers || []).find((p: any) => p.login === currentUser.login);
            if (me?.host) setDisplayLocation(me.host);
          }
        } catch (_) {
          // ignore
        }
      }
    };
    resolveLocation();
  }, [currentUser]);

  // Initialize favorites editor when entering edit mode
  useEffect(() => {
    if (editingFavorites && currentUser) {
      setFavoritesDraft(currentUser.favorites || []);
    }
  }, [editingFavorites]);

  const addFavoriteTech = () => {
    const value = favoriteInput.trim();
    console.log('addFavoriteTech called, input value:', value);
    console.log('Current favoritesDraft:', favoritesDraft);
    if (!value) {
      console.log('Value is empty, returning');
      return;
    }
    // Deduplicate case-insensitive
    const exists = favoritesDraft.some(f => f.toLowerCase() === value.toLowerCase());
    console.log('Does value already exist?', exists);
    if (!exists) {
      console.log('Adding new favorite');
      setFavoritesDraft(prev => {
        const newDraft = [...prev, value];
        console.log('New draft:', newDraft);
        return newDraft;
      });
    }
    setFavoriteInput('');
  };

  const removeFavoriteTech = (tech: string) => {
    setFavoritesDraft(prev => prev.filter(t => t !== tech));
  };

  const saveFavorites = async () => {
    if (!currentUser) return;
    try {
      setSavingFavorites(true);
      setFavoritesError('');
      console.log('Saving favorites:', favoritesDraft);
      const resp = await fetch(`/api/users/${currentUser.id}/favorites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: favoritesDraft }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('Failed to save favorites:', err);
        throw new Error(err.error || 'Failed to save favorites');
      }
      const result = await resp.json();
      console.log('Save response:', result);
      // Refresh user context so dashboard and other pages stay in sync
      await refreshUserData();
      console.log('User data refreshed, new favorites:', currentUser.favorites);
      // Set editing to false AFTER refresh so the draft gets updated with new server data
      setEditingFavorites(false);
    } catch (e: any) {
      console.error('Error saving favorites:', e);
      setFavoritesError(e.message || 'Failed to save favorites');
    } finally {
      setSavingFavorites(false);
    }
  };

  // Function to sync projects from 42 API
  const syncProjects = async () => {
    if (!currentUser) return;

    try {
      setSyncStatus('Syncing projects from 42 API...');
      const response = await fetch(`/api/sync/user/${currentUser.login}/projects/enhanced`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus(`Successfully synced ${data.count} projects!`);
        // Reload active project
        const projectsResponse = await fetch(`/api/projects/user/${currentUser.id}/active`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.data ? [projectsData.data] : []);
        }
      } else {
        const errorData = await response.json();
        setSyncStatus(`Sync failed: ${errorData.error}`);
      }
    } catch (error: any) {
      setSyncStatus(`Sync error: ${error.message}`);
    }

    // Clear sync status after 5 seconds
    setTimeout(() => setSyncStatus(''), 5000);
  };

  const getCurrentProject = () => {
    // Find the most recent in-progress project or the first one
    const inProgressProjects = projects.filter(p => p.status === 'in_progress');
    if (inProgressProjects.length > 0) {
      // Sort by most recent start date or highest completion
      return inProgressProjects.sort((a, b) =>
        b.completion_percentage - a.completion_percentage ||
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0];
    }
    return projects[0] || null;
  };

  const calculateTimeLeft = (deadline: string | null) => {
    if (!deadline) return 'No deadline set';

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const difference = deadlineDate.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        return `${days} days, ${hours} hours`;
      } else if (hours > 0) {
        return `${hours} hours`;
      } else {
        return 'Due very soon!';
      }
    } else {
      return 'Deadline passed';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-400 to-green-500';
      case 'in_progress': return 'bg-blue-400 to-blue-500';
      case 'failed': return 'bg-red-400 to-red-500';
      default: return 'bg-gray-400 to-gray-500';
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
            Welcome back, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{currentUser.name}</span>! 👋
            <br className="sm:hidden" />
            <span className="text-lg text-gray-600 dark:text-gray-400">Ready to continue your journey?</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 transform hover:-translate-y-3 hover:shadow-3xl transition-all duration-500 hover:shadow-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4 ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-lg transform hover:scale-110 transition-all duration-300">
                  <span className="text-white font-bold text-2xl">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">{currentUser.campus}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Level:</span>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentUser.level}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Location:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{displayLocation || 'Offline'}</span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Login:</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{currentUser.login}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Project Card */}
          <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 transform hover:-translate-y-3 hover:shadow-3xl transition-all duration-500 hover:shadow-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  💻 Current Project
                </h2>
                <button
                  onClick={syncProjects}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  disabled={!!syncStatus}
                >
                  {syncStatus ? '🔄' : '🔄'} {syncStatus || 'Sync 42 Projects'}
                </button>
              </div>

              {/* Sync Status */}
              {syncStatus && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                  syncStatus.includes('Successfully') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  syncStatus.includes('failed') || syncStatus.includes('error') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {syncStatus}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading projects...</span>
                </div>
              ) : getCurrentProject() ? (
                <div>
                  <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 mb-6 border border-purple-200/50 dark:border-purple-700/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{getCurrentProject()!.name}</h3>
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(getCurrentProject()!.difficulty_level)}`}>
                          {getCurrentProject()!.difficulty_level}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-${getStatusColor(getCurrentProject()!.status)} text-white shadow-lg`}>
                          ✨ {getCurrentProject()!.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">{getCurrentProject()!.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">Progress: <span className="text-blue-600 dark:text-blue-400 font-bold">{getCurrentProject()!.completion_percentage}%</span></p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getCurrentProject()!.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        {getCurrentProject()!.deadline ? (
                          <>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">Deadline: <span className="text-blue-600 dark:text-blue-400 font-bold">{new Date(getCurrentProject()!.deadline!).toLocaleDateString()}</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Time remaining: <span className="font-bold text-red-500 dark:text-red-400 text-base">{calculateTimeLeft(getCurrentProject()!.deadline!)}</span></p>
                          </>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 font-medium">No deadline set</p>
                        )}
                      </div>
                    </div>

                    {getCurrentProject()!.final_mark !== undefined && getCurrentProject()!.final_mark !== null && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          Final Mark: <span className="font-bold text-green-600 dark:text-green-400">{getCurrentProject()!.final_mark}%</span>
                          {getCurrentProject()!.validated && <span className="ml-2 text-green-600 dark:text-green-400">✅ Validated</span>}
                        </p>
                      </div>
                    )}

                    {getCurrentProject()!.notes && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">📝 {getCurrentProject()!.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Projects stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{projects.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projects.filter(p => p.status === 'in_progress').length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{projects.filter(p => p.status === 'completed').length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No projects found</p>
                    <p className="text-sm mt-2">Click "Sync 42 Projects" to load your projects from 42 API</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorites and Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Technologies */}
        <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <Card hover={true} className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-100 dark:border-green-900/50 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-2 transition-all duration-300">
            <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4 transition-colors duration-300 flex items-center gap-2`}>
              🚀 Favorite Technologies
            </h2>
            {!editingFavorites ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(currentUser.favorites || []).map((tech, index) => (
                    <span
                      key={`${tech}-${index}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {(!currentUser.favorites || currentUser.favorites.length === 0) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No favorites yet</span>
                  )}
                </div>
                <button
                  onClick={() => { setEditingFavorites(true); setFavoriteInput(''); }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium"
                >
                  Edit Favorites
                </button>
              </>
            ) : (
              <>
                {favoritesError && (
                  <div className="mb-3 text-sm text-red-600 dark:text-red-400">{favoritesError}</div>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {favoritesDraft.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md"
                    >
                      {tech}
                      <button
                        onClick={() => removeFavoriteTech(tech)}
                        className="ml-1 rounded-full bg-white/20 hover:bg-white/30 w-5 h-5 flex items-center justify-center"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {favoritesDraft.length === 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Add your favorite technologies</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={favoriteInput}
                    onChange={(e) => setFavoriteInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFavoriteTech(); } }}
                    placeholder="e.g. C, C++, Docker, React"
                    className={`flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 ${theme.bg.secondary} ${theme.text.primary}`}
                  />
                  <button
                    onClick={addFavoriteTech}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveFavorites}
                    disabled={savingFavorites}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md text-sm"
                  >
                    {savingFavorites ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditingFavorites(false); setFavoritesError(''); setFavoriteInput(''); setFavoritesDraft(currentUser?.favorites || []); }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Projects Overview */}
        <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
          <Card hover={true} className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-100 dark:border-orange-900/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300">
            <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4 transition-colors duration-300 flex items-center gap-2`}>
              📊 Projects Overview
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-orange-200 dark:border-orange-800`}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-3"></div>
                      <span className={`${theme.text.primary} transition-colors duration-300 font-medium`}>{project.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                ))}
                {projects.length > 3 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">+{projects.length - 3} more projects</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No projects to display</p>
              </div>
            )}
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;