import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Peers from './pages/Peers';
import Projects from './pages/Projects';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Messages from './pages/Messages';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg.primary}`}>
      <Navbar />
      <main className="transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/peers" element={<Peers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppContent />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App
