import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Course, Assignment, Submission } from '../../types';
import { Link } from 'react-router-dom';
import { MyCoursesIcon, AssignmentsIcon, GradesIcon } from '../../constants/icons';

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, change?: string, changeColor?: string }> = 
({ title, value, icon, change, changeColor = 'text-green-500' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            {change && <p className={`text-xs ${changeColor} mt-1`}>{change}</p>}
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 p-3 rounded-full">
            {icon}
        </div>
    </div>
);

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [averageGrade, setAverageGrade] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      
      const [allCourses, allAssignments, allSubmissions] = await Promise.all([
        api.getCourses(),
        api.getAssignmentsByStudent(user.id),
        api.getSubmissionsByStudent(user.id),
      ]);
      
      const enrolled = allCourses.filter(c => c.enrolledStudentIds.includes(user.id));
      setMyCourses(enrolled);
      
      const submittedAssignmentIds = new Set(allSubmissions.map(s => s.assignmentId));
      const pending = allAssignments.filter(a => !submittedAssignmentIds.has(a.id) && new Date(a.dueDate) > new Date());
      setPendingAssignments(pending);

      const gradedSubmissions = allSubmissions.filter(s => s.grade !== null);
      if (gradedSubmissions.length > 0) {
          const total = gradedSubmissions.reduce((sum, s) => sum + s.grade!, 0);
          setAverageGrade(Math.round(total / gradedSubmissions.length));
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="text-center p-8">Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-8">
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 p-6 rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Continue your learning journey. You have {pendingAssignments.length} pending assignments this week.</p>
        </div>
      
        <div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Enrolled Courses" value={myCourses.length} icon={<MyCoursesIcon className="w-7 h-7" />} />
                <StatCard title="Pending Assignments" value={pendingAssignments.length} icon={<AssignmentsIcon className="w-7 h-7" />} />
                <StatCard title="Average Grade" value={`${averageGrade}%`} icon={<GradesIcon className="w-7 h-7" />} change="+5% from last month" />
            </div>
        </div>

      <div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Continue Learning</h2>
        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCourses.slice(0, 4).map(course => (
              <div key={course.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center space-x-4">
                 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <MyCoursesIcon className="w-8 h-8 text-gray-500" />
                 </div>
                 <div>
                    <Link to={`/courses/${course.id}`} className="font-semibold text-blue-600 hover:underline">{course.title}</Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">by {course.teacherName}</p>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 dark:text-gray-400">You are not enrolled in any courses yet.</p>
            <Link to="/courses" className="mt-2 inline-block text-blue-500 hover:underline">Browse courses</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
