import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Notification as NotificationType } from '../../types';
import { BellIcon, MoonIcon, SunIcon, UserCircleIcon, CogIcon, ArrowRightOnRectangleIcon } from '../../constants/icons';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
    theme: string;
    toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      api.getNotifications(user.id).then(setNotifications);
    }
  }, [user]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setShowProfileMenu(false);
        }
        if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getInitials = (name: string = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6">
      <div>
        {/* Potentially a search bar or breadcrumbs can go here */}
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none" title="Toggle theme">
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6 text-yellow-400" />}
        </button>
        
        <div className="relative" ref={notificationsMenuRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative focus:outline-none p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
             <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border dark:border-gray-700 z-10">
                <div className="p-4 font-bold border-b dark:border-gray-700 text-gray-800 dark:text-gray-100">Notifications</div>
                <ul>
                    {notifications.length > 0 ? notifications.map(n => (
                        <li key={n.id} className={`p-4 border-b dark:border-gray-700 text-sm ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''} text-gray-700 dark:text-gray-300`}>
                            {n.message}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </li>
                    )) : <li className="p-4 text-sm text-gray-500 dark:text-gray-400">No new notifications.</li>}
                </ul>
             </div>
          )}
        </div>

        <div className="relative" ref={profileMenuRef}>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-3 focus:outline-none">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
              {getInitials(user?.name)}
            </div>
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-gray-800 dark:text-gray-100">{user?.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{user?.role}</div>
            </div>
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 border dark:border-gray-700 z-10">
              <div className="px-4 py-2 border-b dark:border-gray-700">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <Link to="/profile" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserCircleIcon className="h-5 w-5 mr-3" />
                My Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;