import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
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
      urgency: 'high'
    },
    {
      id: 2,
      user: users.find(u => u.id === 3) || users[2],
      project: 'minishell',
      skillsNeeded: ['C', 'Shell Scripting', 'Process Management'],
      description: 'Working on shell implementation. Could use help with signal handling and process management.',
      postedDate: '2025-10-18T14:15:00Z',
      urgency: 'medium'
    },
    {
      id: 3,
      user: users.find(u => u.id === 5) || users[4],
      project: 'so_long',
      skillsNeeded: ['C', 'Graphics', 'Game Development'],
      description: 'Building a 2D game. Need someone to help with sprite animations and collision detection.',
      postedDate: '2025-10-17T16:45:00Z',
      urgency: 'low'
    },
    {
      id: 4,
      user: users.find(u => u.id === 4) || users[3],
      project: 'inception',
      skillsNeeded: ['Docker', 'DevOps', 'System Administration'],
      description: 'Setting up complex Docker infrastructure. Looking for DevOps expertise with container orchestration.',
      postedDate: '2025-10-20T08:20:00Z',
      urgency: 'medium'
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-2">Manage your current project and find teammates</p>
      </div>

      {/* Current Project Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentUser.current_project.name}</h2>
              <p className="text-blue-100">Your current project</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{timeLeft.split(',')[0] || timeLeft}</div>
              <div className="text-blue-100 text-sm">remaining</div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Deadline: {new Date(currentUser.current_project.deadline).toLocaleDateString()}</span>
              <span>Progress: 65%</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
              <div className="bg-white h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Looking for Teammates Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Looking for Teammates</h2>
            
            <div className="space-y-4">
              {teammateRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {request.user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.user.name}</h3>
                        <p className="text-gray-600 text-sm">Level {request.user.level} • {formatTimeAgo(request.postedDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">Project: {request.project}</h4>
                    <p className="text-gray-600 text-sm">{request.description}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Skills needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.skillsNeeded.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    Contact for Collaboration
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coinflip Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Coinflip for Work</h2>
            <p className="text-gray-600 text-sm mb-6">
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
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">🎉 Coin Flip Result</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-green-100 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {coinflipResult.winner.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">👑 Winner</p>
                      <p className="text-sm text-green-700">{coinflipResult.winner.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {coinflipResult.loser.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">Runner-up</p>
                      <p className="text-sm text-gray-500">{coinflipResult.loser.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available teammates:</span>
                <span className="font-semibold">{teammateRequests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">High priority requests:</span>
                <span className="font-semibold text-red-600">
                  {teammateRequests.filter(r => r.urgency === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your level:</span>
                <span className="font-semibold text-blue-600">{currentUser.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;