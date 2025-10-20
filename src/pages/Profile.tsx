const Profile = () => {
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Full Stack Developer",
    bio: "Passionate developer with 5+ years of experience in React, Node.js, and TypeScript.",
    location: "San Francisco, CA",
    joinedDate: "January 2022"
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{mockUser.name}</h2>
              <p className="text-gray-600">{mockUser.role}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{mockUser.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{mockUser.location}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">{mockUser.joinedDate}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900">{mockUser.bio}</dd>
            </div>
          </dl>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;