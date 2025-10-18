import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserCircleIcon } from '../constants/icons';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center p-8">User not found.</div>;
  }
  
  const getInitials = (name: string = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-5xl flex-shrink-0">
          {getInitials(user.name)}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6">Account Information</h3>
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                <p className="text-lg text-gray-800 dark:text-gray-100">{user.name}</p>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                <p className="text-lg text-gray-800 dark:text-gray-100">{user.email}</p>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                <p className="text-lg text-gray-800 dark:text-gray-100">{user.role}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
