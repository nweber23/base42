import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import Card from '../components/Card';

const Dashboard = () => {
  const { currentUser } = useUser();
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
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
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [currentUser.current_project.deadline]);

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className={`text-3xl font-bold ${theme.text.primary} transition-colors duration-300`}>Dashboard</h1>
        <p className={`${theme.text.secondary} mt-2 transition-colors duration-300`}>Welcome back, {currentUser.name}! 👋</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1 animate-slide-up">
          <Card>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 ring-4 ring-blue-100 dark:ring-blue-900 transform hover:scale-105 transition-all duration-200">
                <span className="text-white font-bold text-xl">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${theme.text.primary} transition-colors duration-300`}>{currentUser.name}</h2>
                <p className={`${theme.text.secondary} transition-colors duration-300`}>{currentUser.campus}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`${theme.text.secondary} transition-colors duration-300`}>Level:</span>
                <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentUser.level}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`${theme.text.secondary} transition-colors duration-300`}>Location:</span>
                <span className={`font-medium ${theme.text.primary} transition-colors duration-300`}>{currentUser.location}</span>
              </div>
              
              <div className={`pt-2 border-t ${theme.border.primary} transition-colors duration-300`}>
                <span className={`${theme.text.secondary} text-sm transition-colors duration-300`}>Last Login:</span>
                <p className={`font-medium text-sm ${theme.text.primary} transition-colors duration-300`}>{formatLastLogin(currentUser.last_login)}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Current Project Card */}
        <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <Card>
            <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4 transition-colors duration-300`}>Current Project</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-4 transition-colors duration-300">
              <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2 transition-colors duration-300`}>{currentUser.current_project.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.secondary} transition-colors duration-300`}>Deadline: {new Date(currentUser.current_project.deadline).toLocaleDateString()}</p>
                  <p className={`text-sm ${theme.text.tertiary} mt-1 transition-colors duration-300`}>Time remaining: <span className="font-medium text-red-600 dark:text-red-400">{timeLeft}</span></p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 transition-colors duration-300">
                    In Progress
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress visualization */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
            <p className={`text-xs ${theme.text.tertiary} mt-1 transition-colors duration-300`}>Estimated progress: 65%</p>
          </Card>
        </div>
      </div>
      
      {/* Favorites and Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Technologies */}
        <div className="animate-slide-up delay-200">
          <Card>
            <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4 transition-colors duration-300`}>Favorite Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {currentUser.favorites.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700 transition-colors duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Upcoming Events */}
        <div className="animate-slide-up delay-300">
          <Card>
            <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4 transition-colors duration-300`}>Upcoming Events</h2>
            <div className="space-y-2">
              {currentUser.events.map((event, index) => (
                <div key={index} className={`flex items-center p-2 ${theme.bg.tertiary} rounded-md transition-colors duration-300`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className={`${theme.text.primary} transition-colors duration-300`}>{event}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;