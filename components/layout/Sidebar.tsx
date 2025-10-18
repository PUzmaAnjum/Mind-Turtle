import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { DashboardIcon, CoursesIcon, MyCoursesIcon, CodeIcon, TodoIcon, TurtleIcon, AssignmentsIcon, GradesIcon, PlusCircleIcon, ArrowRightOnRectangleIcon } from '../../constants/icons';

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, children: React.ReactNode }> = ({ to, icon, children }) => {
    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => 
                `flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 transition-colors duration-200 transform rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-200 dark:bg-gray-700 font-bold text-gray-900 dark:text-white' : 'hover:text-gray-900 dark:hover:text-white'}`
            }
        >
            {icon}
            <span className="mx-4 font-medium">{children}</span>
        </NavLink>
    );
}

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <TurtleIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-white">MindTurtle</h1>
        </div>
        <div className="flex flex-col justify-between flex-1">
            <nav className="px-4 py-6 space-y-2">
                <p className="px-4 py-2 text-xs text-gray-400 uppercase">Navigation</p>
                <SidebarLink to="/dashboard" icon={<DashboardIcon className="h-6 w-6" />}>Dashboard</SidebarLink>
                
                {user?.role === UserRole.Student && (
                    <SidebarLink to="/my-courses" icon={<MyCoursesIcon className="h-6 w-6" />}>My Courses</SidebarLink>
                )}

                <SidebarLink to="/courses" icon={<CoursesIcon className="h-6 w-6" />}>Browse Courses</SidebarLink>
                
                {user?.role === UserRole.Teacher && (
                    <SidebarLink to="/create-course" icon={<PlusCircleIcon className="h-6 w-6" />}>Create Course</SidebarLink>
                )}

                {user?.role === UserRole.Student && (
                    <>
                        <SidebarLink to="/assignments" icon={<AssignmentsIcon className="h-6 w-6" />}>Assignments</SidebarLink>
                        <SidebarLink to="/grades" icon={<GradesIcon className="h-6 w-6" />}>Grades</SidebarLink>
                    </>
                )}
                
                <p className="px-4 py-2 mt-4 text-xs text-gray-400 uppercase">Tools</p>
                <SidebarLink to="/code-playground" icon={<CodeIcon className="h-6 w-6" />}>Playground</SidebarLink>
                <SidebarLink to="/todo" icon={<TodoIcon className="h-6 w-6" />}>To-Do List</SidebarLink>
            </nav>
            <div className="px-4 py-4">
                 <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-300 transition-colors duration-200 transform rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    <span className="mx-4 font-medium">Logout</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;