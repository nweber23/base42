import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import Card from '../components/Card';

interface Project {
  id: number;
  name: string;
  description: string;
  difficulty_level: string;
  category: string;
}

interface UserProject {
  id: number;
  project_id: number;
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

interface ProjectOverview extends UserProject {
  user_name: string;
  user_login: string;
  campus: string;
}

const Projects = () => {
  const { currentUser } = useUser();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'personal'>('overview');
  const [projectOverview, setProjectOverview] = useState<ProjectOverview[]>([]);
  const [activeProject, setActiveProject] = useState<UserProject | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'overview') {
        const response = await fetch('/api/projects/overview');
        if (!response.ok) throw new Error('Failed to fetch project overview');
        const data = await response.json();
        setProjectOverview(data.data || []);
      } else if (activeTab === 'personal' && currentUser) {
        // Load active project and available projects
        const [activeResponse, availableResponse] = await Promise.all([
          fetch(`/api/projects/user/${currentUser.id}/active`),
          fetch('/api/projects/available')
        ]);
        
        if (!activeResponse.ok) throw new Error('Failed to fetch active project');
        if (!availableResponse.ok) throw new Error('Failed to fetch available projects');
        
        const activeData = await activeResponse.json();
        const availableData = await availableResponse.json();
        
        setActiveProject(activeData.data || null);
        setAvailableProjects(availableData.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async () => {
    if (!currentUser || !selectedProject) return;
    
    try {
      const response = await fetch(`/api/projects/user/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject,
          deadline: deadline || null,
          notes: notes || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add project');
      }
      
      // Reset form and reload active project
      setShowAddProject(false);
      setSelectedProject(null);
      setDeadline('');
      setNotes('');
      
      // Reload active project
      const activeResponse = await fetch(`/api/projects/user/${currentUser.id}/active`);
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setActiveProject(activeData.data || null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateActiveProject = async (field: string, value: any) => {
    if (!currentUser || !activeProject) return;
    
    try {
      const response = await fetch(`/api/projects/user/${currentUser.id}/${activeProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (!response.ok) throw new Error('Failed to update project');
      
      // Update local state immediately
      setActiveProject(prev => prev ? { ...prev, [field]: value } : null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteActiveProject = async () => {
    if (!currentUser || !activeProject) return;
    
    try {
      const response = await fetch(`/api/projects/user/${currentUser.id}/${activeProject.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      setActiveProject(null);
    } catch (err: any) {
      setError(err.message);
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

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Projects
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
            Track student projects and manage your own progress
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Project Overview
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === 'personal'
                  ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              My Projects
            </button>
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
            <span className={`text-lg ${theme.text.primary}`}>Loading projects...</span>
          </div>
        )}

        {/* Project Overview Tab */}
        {!loading && activeTab === 'overview' && (
          <>
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>Student Projects in Progress</h2>
              <p className={`${theme.text.secondary}`}>
                See what projects other students are currently working on
              </p>
            </div>

            {projectOverview.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  No projects in progress at the moment
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectOverview.map((project) => (
                  <Card key={project.id} hover={true} className="bg-white dark:bg-gray-800">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`text-lg font-bold ${theme.text.primary} mb-1`}>{project.name}</h3>
                          <p className={`text-sm ${theme.text.secondary} mb-2`}>{project.user_name} (@{project.user_login})</p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(project.difficulty_level)}`}>
                            {project.difficulty_level}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded`}>
                          {project.campus}
                        </span>
                      </div>

                      <p className={`text-sm ${theme.text.secondary} mb-4`}>{project.description}</p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-medium ${theme.text.primary}`}>Progress</span>
                            <span className={`text-sm ${theme.text.secondary}`}>{project.completion_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${project.completion_percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {project.deadline && (
                          <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                            <span className={`text-sm font-medium ${theme.text.primary}`}>Deadline:</span>
                            <span className={`text-sm ${theme.text.secondary}`}>
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {project.notes && (
                          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                            <p className={`text-sm ${theme.text.secondary}`}>📝 {project.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Personal Projects Tab */}
        {!loading && activeTab === 'personal' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>My Active Project</h2>
                <p className={`${theme.text.secondary}`}>
                  You can only have one active project at a time
                </p>
              </div>
              {!activeProject && (
                <button
                  onClick={() => setShowAddProject(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  ➕ Add Project
                </button>
              )}
            </div>

            {/* Add Project Modal */}
            {showAddProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Add New Project</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>Project</label>
                      <select
                        value={selectedProject || ''}
                        onChange={(e) => setSelectedProject(parseInt(e.target.value))}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary} rounded-lg`}
                      >
                        <option value="">Select a project...</option>
                        {availableProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name} ({project.difficulty_level})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>Deadline (Optional)</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary} rounded-lg`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>Notes (Optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary} rounded-lg`}
                        placeholder="Add any notes about this project..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowAddProject(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addProject}
                      disabled={!selectedProject}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!activeProject ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg mb-2">No active project</p>
                  <p>Click "Add Project" to start working on a 42 common core project</p>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <Card hover={false} className="bg-white dark:bg-gray-800">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className={`text-3xl font-bold ${theme.text.primary} mb-3`}>{activeProject.name}</h3>
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(activeProject.difficulty_level)} mb-3`}>
                          {activeProject.difficulty_level}
                        </span>
                        <p className={`text-lg ${theme.text.secondary} mb-4`}>{activeProject.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <select
                          value={activeProject.status}
                          onChange={(e) => updateActiveProject('status', e.target.value)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary}`}
                        >
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                        <button
                          onClick={deleteActiveProject}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Progress Section */}
                      <div>
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-lg font-medium ${theme.text.primary}`}>Progress</span>
                            <span className={`text-lg font-bold text-blue-600 dark:text-blue-400`}>{activeProject.completion_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500" 
                              style={{ width: `${activeProject.completion_percentage}%` }}
                            ></div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={activeProject.completion_percentage}
                            onChange={(e) => updateActiveProject('completion_percentage', parseInt(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Deadline Section */}
                        <div className="mb-6">
                          <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>Deadline</label>
                          <input
                            type="date"
                            value={activeProject.deadline ? activeProject.deadline.split('T')[0] : ''}
                            onChange={(e) => updateActiveProject('deadline', e.target.value ? e.target.value + 'T00:00:00.000Z' : null)}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary} rounded-lg`}
                          />
                        </div>
                      </div>

                      {/* Notes and Details Section */}
                      <div>
                        <div className="mb-6">
                          <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>Notes</label>
                          <textarea
                            value={activeProject.notes || ''}
                            onChange={(e) => updateActiveProject('notes', e.target.value)}
                            rows={6}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 ${theme.bg.secondary} ${theme.text.primary} rounded-lg`}
                            placeholder="Add your notes about this project..."
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${theme.text.primary}`}>Started:</span>
                              <span className={`text-sm ${theme.text.secondary}`}>
                                {new Date(activeProject.started_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {activeProject.final_mark !== undefined && activeProject.final_mark !== null && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${theme.text.primary}`}>Final Mark:</span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {activeProject.final_mark}% {activeProject.validated && '✅'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;
