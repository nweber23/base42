import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import Card from '../components/Card';
import type { User } from '../types';

interface TeammateRequest {
  id: number;
  user: User;
  project: string;
  skillsNeeded: string[];
  description: string;
  postedDate: string;
  urgency: 'low' | 'medium' | 'high';
}

interface CoinflipResult {
  winner: User;
  loser: User;
  isFlipping: boolean;
}

const Projects: React.FC = () => {
  const { currentUser, users } = useUser();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [coinflipResult, setCoinflipResult] = useState<CoinflipResult | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Mock teammate requests data
  const teammateRequests: TeammateRequest[] = [
    {
      id: 1,
      user: users.find(u => u.id === 2) || users[1],
      project: 'webserv',
      skillsNeeded: ['C++', 'HTTP', 'Networking'],
      description: 'Need help implementing HTTP server functionality. Looking for someone experienced with socket programming.',
      postedDate: '2025-10-19T10:30:00Z',
      urgency: 'high' as const
    },
    {
      id: 2,
      user: users.find(u => u.id === 3) || users[2],
      project: 'minishell',
      skillsNeeded: ['C', 'Shell Scripting', 'Process Management'],
      description: 'Working on shell implementation. Could use help with signal handling and process management.',
      postedDate: '2025-10-18T14:15:00Z',
      urgency: 'medium' as const
    },
    {
      id: 3,
      user: users.find(u => u.id === 5) || users[4],
      project: 'so_long',
      skillsNeeded: ['C', 'Graphics', 'Game Development'],
      description: 'Building a 2D game. Need someone to help with sprite animations and collision detection.',
      postedDate: '2025-10-17T16:45:00Z',
      urgency: 'low' as const
    },
    {
      id: 4,
      user: users.find(u => u.id === 4) || users[3],
      project: 'inception',
      skillsNeeded: ['Docker', 'DevOps', 'System Administration'],
      description: 'Setting up complex Docker infrastructure. Looking for DevOps expertise with container orchestration.',
      postedDate: '2025-10-20T08:20:00Z',
      urgency: 'medium' as const
    }
  ].filter(request => request.user.id !== currentUser.id);

  // Calculate deadline countdown
  useEffect(() => {
    const calculateTimeLeft = (): void => {
      const deadline = new Date(currentUser.current_project.deadline);
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days} days, ${hours} hours`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} hours, ${minutes} minutes`);
        } else {
          setTimeLeft(`${minutes} minutes`);
        }
      } else {
        setTimeLeft('Deadline passed');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [currentUser.current_project.deadline]);

  // Coinflip functionality
  const handleCoinflip = useCallback((): void => {
    if (teammateRequests.length < 2) return;
    
    setIsFlipping(true);
    setCoinflipResult(null);

    // Simulate coin flip animation delay
    setTimeout(() => {
      const availableTeammates = teammateRequests.map(req => req.user);
      const shuffled = [...availableTeammates].sort(() => Math.random() - 0.5);
      const [winner, loser] = shuffled.slice(0, 2);
      
      setCoinflipResult({
        winner,
        loser,
        isFlipping: false
      });
      setIsFlipping(false);
    }, 2000);
  }, [teammateRequests]);

  const getUrgencyColor = (urgency: TeammateRequest['urgency']): string => {
    switch (urgency) {
      case 'high': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">Projects</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">Manage your current project and find teammates</p>
      </div>

      {/* Current Project Section */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 p-6 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentUser.current_project.name}</h2>
              <p className="text-blue-100 dark:text-blue-200">Your current project</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{timeLeft.split(',')[0] || timeLeft}</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm">remaining</div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 dark:bg-black dark:bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <span>Deadline: {new Date(currentUser.current_project.deadline).toLocaleDateString()}</span>
              <span>Progress: 65%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 dark:bg-black dark:bg-opacity-30 rounded-full h-2 mt-2">
              <div className="bg-white dark:bg-blue-200 h-2 rounded-full transition-all duration-300" style={{width: '65%'}}></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Looking for Teammates Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 transition-colors duration-300">Looking for Teammates</h2>
            
            <div className="space-y-4">
              {teammateRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900 transition-all duration-200">
                        <span className="text-white font-semibold text-sm">
                          {request.user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{request.user.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Level {request.user.level} • {formatTimeAgo(request.postedDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">Project: {request.project}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{request.description}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Skills needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.skillsNeeded.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 transition-all duration-300 hover:scale-105">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 text-sm font-medium transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                    Contact for Collaboration
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Coinflip Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">Coinflip for Work</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 transition-colors duration-300">
              Can't decide between teammates? Let fate decide!
            </p>
            
            <button
              onClick={handleCoinflip}
              disabled={isFlipping || teammateRequests.length < 2}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isFlipping
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isFlipping ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Flipping...</span>
                </div>
              ) : (
                '🪙 Flip Coin'
              )}
            </button>
            
            {coinflipResult && !isFlipping && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-300">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 transition-colors duration-300">🎉 Coin Flip Result</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-green-100 dark:bg-green-800 rounded-lg transition-colors duration-300">
                    <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {coinflipResult.winner.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200 transition-colors duration-300">👑 Winner</p>
                      <p className="text-sm text-green-700 dark:text-green-300 transition-colors duration-300">{coinflipResult.winner.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                    <div className="w-8 h-8 bg-gray-500 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {coinflipResult.loser.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">Runner-up</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{coinflipResult.loser.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          {/* Quick Stats */}
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Available teammates:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300">{teammateRequests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">High priority requests:</span>
                <span className="font-semibold text-red-600 dark:text-red-400 transition-colors duration-300">
                  {teammateRequests.filter(r => r.urgency === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Your level:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 transition-colors duration-300">{currentUser.level}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Projects;