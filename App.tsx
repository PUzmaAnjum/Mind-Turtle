import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage from './pages/MyCoursesPage';
import AssignmentPage from './pages/AssignmentPage';
import CodePlaygroundPage from './pages/CodePlaygroundPage';
import TodoListPage from './pages/TodoListPage';
import Layout from './components/layout/Layout';
import AllAssignmentsPage from './pages/AllAssignmentsPage';
import GradesPage from './pages/GradesPage';
import CreateCoursePage from './pages/CreateCoursePage';
import ProfilePage from './pages/ProfilePage';
import ScoreboardPage from './pages/ScoreboardPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('mindturtle-theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mindturtle-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                <Route path="/my-courses" element={<MyCoursesPage />} />
                <Route path="/assignments" element={<AllAssignmentsPage />} />
                <Route path="/grades" element={<GradesPage />} />
                <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentPage />} />
                <Route path="/courses/:courseId/scoreboard" element={<ScoreboardPage />} />
                <Route path="/code-playground" element={<CodePlaygroundPage />} />
                <Route path="/todo" element={<TodoListPage />} />
                <Route path="/create-course" element={<CreateCoursePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen font-sans">
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </div>
  );
}