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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Dashboard 📊
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
                  <span className="font-semibold text-gray-900 dark:text-white">{currentUser.location}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Last Login:</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{formatLastLogin(currentUser.last_login)}</p>
                </div>
              </div>
            </div>
          </div>
        
          {/* Current Project Card */}
          <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 transform hover:-translate-y-3 hover:shadow-3xl transition-all duration-500 hover:shadow-purple-500/20 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                💻 Current Project
              </h2>
              
              <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 rounded-xl p-6 mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{currentUser.current_project.name}</h3>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Deadline: <span className="text-blue-600 dark:text-blue-400 font-bold">{new Date(currentUser.current_project.deadline).toLocaleDateString()}</span></p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Time remaining: <span className="font-bold text-red-500 dark:text-red-400 text-base">{timeLeft}</span></p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg">
                      ✨ In Progress
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress visualization */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Progress</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">65%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                  <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out" style={{width: '65%'}}></div>
                </div>
              </div>
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
            <div className="flex flex-wrap gap-2">
              {currentUser.favorites.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Upcoming Events */}
        <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
          <Card hover={true} className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-900 border-2 border-orange-100 dark:border-orange-900/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300">
            <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4 transition-colors duration-300 flex items-center gap-2`}>
              📅 Upcoming Events
            </h2>
            <div className="space-y-3">
              {currentUser.events.map((event, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-3 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-orange-200 dark:border-orange-800`}
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-3 animate-pulse"></div>
                  <span className={`${theme.text.primary} transition-colors duration-300 font-medium`}>{event}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;