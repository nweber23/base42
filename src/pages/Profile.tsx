import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import type { StudentSearchResult, StudentProfile } from '../types';

const Profile = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Load profile from URL parameter if present
  useEffect(() => {
    const login = searchParams.get('login');
    if (login) {
      loadStudentProfile(login);
    }
  }, [searchParams]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/students/search?query=${encodeURIComponent(value)}`
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setSearchResults(data.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // Load full student profile
  const loadStudentProfile = async (login: string) => {
    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      console.log('Loading profile for:', login);
      const response = await fetch(`${API_BASE_URL}/api/students/${login}`);

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Student not found');
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      console.log('Profile data received:', data);

      if (!data.data) {
        throw new Error('Invalid response format');
      }

      // Validate the data structure
      const profileData = data.data;
      console.log('Setting student profile:', {
        login: profileData.login,
        hasSkills: Array.isArray(profileData.skills),
        skillsCount: profileData.skills?.length || 0,
        hasProjects: Array.isArray(profileData.projects),
        projectsCount: profileData.projects?.length || 0
      });

      setSelectedStudent(profileData);
      setSearchQuery(login);

      // Update URL
      window.history.pushState({}, '', `/profile?login=${login}`);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a student from suggestions
  const handleSelectStudent = (student: StudentSearchResult) => {
    loadStudentProfile(student.login);
  };

  // Handle message button
  const handleMessageStudent = async () => {
    if (!selectedStudent || !currentUser) return;

    try {
      // Get the user's database ID
      const response = await fetch(`${API_BASE_URL}/api/students/${selectedStudent.login}/id`);
      if (!response.ok) throw new Error('Failed to get user ID');

      const data = await response.json();
      const userId = data.data.id;

      // Navigate to messages page with this user
      navigate(`/messages?user=${userId}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation');
    }
  };

  // Clear selection
  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedStudent(null);
    setSearchResults([]);
    setShowSuggestions(false);
    setError(null);
    window.history.pushState({}, '', '/profile');
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Student Search
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
            Find and connect with 42 Heilbronn students
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative" ref={searchRef}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                placeholder="Search by login (e.g., nweber)..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {(searchQuery || selectedStudent) && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
              {searchResults.map((student) => (
                <button
                  key={student.login}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  {student.image && (
                    <img
                      src={student.image}
                      alt={student.login}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {student.displayname}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        @{student.login}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>Level {typeof student.level === 'number' ? student.level.toFixed(2) : student.level || '0.00'}</span>
                      {student.location && (
                        <span className="text-green-500">● {student.location}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        )}

        {/* Selected Student Profile */}
        {!loading && selectedStudent && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="flex items-start gap-6">
                {selectedStudent.image ? (
                  <img
                    src={selectedStudent.image}
                    alt={selectedStudent.login}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.displayname || selectedStudent.login)}&size=128&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold">
                    {(selectedStudent.displayname || selectedStudent.login).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-2">{selectedStudent.displayname || selectedStudent.login}</h2>
                  <p className="text-xl opacity-90 mb-3">@{selectedStudent.login}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                      Level {typeof selectedStudent.level === 'number' ? selectedStudent.level.toFixed(2) : selectedStudent.level || '0.00'}
                    </span>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                      {selectedStudent.campus || 'Unknown'}
                    </span>
                    {selectedStudent.location && (
                      <span className="px-4 py-2 bg-green-500/80 backdrop-blur rounded-full text-sm font-semibold">
                        ● Online at {selectedStudent.location}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleMessageStudent}
                  className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  📨 Message
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Current Project */}
                {selectedStudent.current_project && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Current Project
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedStudent.current_project}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Wallet</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₳{selectedStudent.wallet || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Evaluation Points</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedStudent.correction_point || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                {(selectedStudent.github || selectedStudent.linkedin) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Links
                    </h3>
                    <div className="flex gap-3">
                      {selectedStudent.github && (
                        <a
                          href={selectedStudent.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      )}
                      {selectedStudent.linkedin && (
                        <a
                          href={selectedStudent.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Top Skills */}
                {selectedStudent.skills && Array.isArray(selectedStudent.skills) && selectedStudent.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Top Skills
                    </h3>
                    <div className="space-y-3">
                      {selectedStudent.skills.slice(0, 5).map((skill, index) => {
                        const skillLevel = typeof skill.level === 'number' ? skill.level : parseFloat(skill.level) || 0;
                        return (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {skill.name || 'Unknown'}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {skillLevel.toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((skillLevel / 20) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Projects */}
                {selectedStudent.projects && selectedStudent.projects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Recent Projects
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.projects.slice(0, 5).map((project, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {project.validated !== null && (
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  project.validated
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                              >
                                {project.validated ? '✓ Passed' : '✗ Failed'}
                              </span>
                            )}
                            {project.final_mark !== null && (
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {project.final_mark}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedStudent && !error && (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Search for a student
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a login name to find and view student profiles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;