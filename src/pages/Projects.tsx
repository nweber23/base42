import { useUser } from '../contexts/UserContext';


const Messages = () => {
  const { currentUser } = useUser();
  

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Projects
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
            Coming soon! This page will show your projects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Messages;