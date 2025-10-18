import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <>
            {user?.role === UserRole.Student && <StudentDashboard />}
            {user?.role === UserRole.Teacher && <TeacherDashboard />}
        </>
    );
};

export default DashboardPage;
