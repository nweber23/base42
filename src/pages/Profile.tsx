import { useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import type { User, SocialLinks } from '../types';

interface SocialLinkProps {
  platform: keyof SocialLinks;
  url: string;
  label: string;
}

interface ProfileStatsProps {
  user: User;
}

interface CopyButtonProps {
  profileUrl: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ platform, url, label }) => {
  const getSocialIcon = (platform: keyof SocialLinks): React.ReactNode => {
    switch (platform) {
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getSocialColor = (platform: keyof SocialLinks): string => {
    switch (platform) {
      case 'github': return 'text-gray-700 hover:text-gray-900';
      case 'linkedin': return 'text-blue-600 hover:text-blue-700';
      case 'twitter': return 'text-blue-400 hover:text-blue-500';
      default: return 'text-gray-600 hover:text-gray-800';
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center space-x-3 p-3 rounded-lg border hover:shadow-md transition-all duration-200 ${getSocialColor(platform)}`}
      title={`Visit ${label} profile`}
    >
      <div className="flex-shrink-0">
        {getSocialIcon(platform)}
      </div>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm opacity-70">{url.replace(/^https?:\/\//, '')}</div>
      </div>
      <div className="flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
};

const CopyButton: React.FC<CopyButtonProps> = ({ profileUrl }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = profileUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  }, [profileUrl]);

  return (
    <button
      onClick={copyToClipboard}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        copied
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      }`}
      title="Copy profile link to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy Profile Link</span>
        </>
      )}
    </button>
  );
};

const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const calculateDaysAtCampus = (lastLogin: string): number => {
    const loginDate = new Date(lastLogin);
    const now = new Date();
    // Simulate join date as 6 months before last login
    const joinDate = new Date(loginDate.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
    const diffTime = now.getTime() - joinDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const stats = [
    {
      label: 'Current Level',
      value: user.level.toString(),
      icon: '📊',
      color: 'text-blue-600'
    },
    {
      label: 'Days at Campus',
      value: calculateDaysAtCampus(user.last_login).toString(),
      icon: '📅',
      color: 'text-green-600'
    },
    {
      label: 'Favorite Technologies',
      value: user.favorites.length.toString(),
      icon: '💻',
      color: 'text-purple-600'
    },
    {
      label: 'Upcoming Events',
      value: user.events.length.toString(),
      icon: '🎯',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

const Profile: React.FC = () => {
  const { currentUser } = useUser();
  
  // Generate fake profile URL
  const profileUrl = `https://profile.42heilbronn.de/users/${currentUser.name.toLowerCase().replace(' ', '.')}`;
  
  // Get available social links
  const socialLinks: Array<{ platform: keyof SocialLinks; url: string; label: string }> = [];
  
  if (currentUser.socials.github) {
    socialLinks.push({
      platform: 'github',
      url: currentUser.socials.github,
      label: 'GitHub'
    });
  }
  
  if (currentUser.socials.linkedin) {
    socialLinks.push({
      platform: 'linkedin',
      url: currentUser.socials.linkedin,
      label: 'LinkedIn'
    });
  }
  
  if (currentUser.socials.twitter) {
    socialLinks.push({
      platform: 'twitter',
      url: currentUser.socials.twitter,
      label: 'Twitter'
    });
  }

  const formatLastLogin = (dateString: string): string => {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl font-bold text-blue-600">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            {/* User Info */}
            <div className="text-white text-center sm:text-left flex-grow">
              <h1 className="text-3xl font-bold mb-2">{currentUser.name}</h1>
              <div className="space-y-1">
                <p className="text-blue-100 flex items-center justify-center sm:justify-start">
                  <span className="mr-2">🏫</span>
                  {currentUser.campus}
                </p>
                <p className="text-blue-100 flex items-center justify-center sm:justify-start">
                  <span className="mr-2">📊</span>
                  Level {currentUser.level}
                </p>
                <p className="text-blue-100 flex items-center justify-center sm:justify-start">
                  <span className="mr-2">📍</span>
                  {currentUser.location}
                </p>
              </div>
            </div>
            
            {/* Copy Profile Button */}
            <div className="flex-shrink-0">
              <CopyButton profileUrl={profileUrl} />
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Project */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Project</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{currentUser.current_project.name}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⏰</span>
                    <span>Deadline: {new Date(currentUser.current_project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Connect</h2>
                  <div className="space-y-3">
                    {socialLinks.map((link) => (
                      <SocialLink
                        key={link.platform}
                        platform={link.platform}
                        url={link.url}
                        label={link.label}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Technologies */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Favorite Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {currentUser.favorites.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats and Additional Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Statistics</h2>
                <ProfileStats user={currentUser} />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Activity</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">⏰</span>
                      <div>
                        <div className="font-medium text-gray-900">Last Login</div>
                        <div className="text-sm">{formatLastLogin(currentUser.last_login)}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">🎯</span>
                      <div>
                        <div className="font-medium text-gray-900">Upcoming Events</div>
                        <div className="text-sm">{currentUser.events.length} events planned</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;