import { useUser } from '../contexts/UserContext';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { currentUser } = useUser();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}!</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{currentUser.name}</h2>
                <p className="text-gray-600">{currentUser.campus}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Level:</span>
                <span className="font-semibold text-lg text-blue-600">{currentUser.level}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{currentUser.location}</span>
              </div>
              
              <div className="pt-2 border-t">
                <span className="text-gray-600 text-sm">Last Login:</span>
                <p className="font-medium text-sm">{formatLastLogin(currentUser.last_login)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Project Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Project</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentUser.current_project.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Deadline: {new Date(currentUser.current_project.deadline).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Time remaining: <span className="font-medium text-red-600">{timeLeft}</span></p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    In Progress
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress visualization could go here */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Estimated progress: 65%</p>
          </div>
        </div>
      </div>
      
      {/* Favorites and Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Technologies */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Favorite Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {currentUser.favorites.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="space-y-2">
            {currentUser.events.map((event, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;