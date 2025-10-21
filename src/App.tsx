import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Peers from './pages/Peers';
import Projects from './pages/Projects';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Login from './pages/Login';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading, login } = useUser();

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${theme.text.primary} text-lg`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme.bg.primary} relative`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,206,84,0.1),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.05),transparent_50%)] dark:opacity-60 pointer-events-none"></div>

      <div className="relative z-10">
        <Navbar />
        <main className={`transition-all duration-300`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/peers" element={<Peers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth/success" element={<Login onLogin={login} />} />
          <Route path="/auth/error" element={<Login onLogin={login} />} />
        </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <Router>
            <AppContent />
          </Router>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App
