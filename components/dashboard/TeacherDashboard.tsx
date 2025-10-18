import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Course, Submission } from '../../types';
import { Link } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      const allCourses = await api.getCourses();
      const createdCourses = allCourses.filter(c => c.teacherId === user.id);
      setMyCourses(createdCourses);
      
      // This is a simplified fetch. A real backend would be more efficient.
      let submissions: Submission[] = [];
      for (const course of createdCourses) {
          const assignments = await api.getAssignmentsByCourse(course.id);
          for (const assignment of assignments) {
              const subs = await api.getSubmissionsByAssignment(assignment.id);
              submissions.push(...subs);
          }
      }

      const recent = submissions
        .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5);

      setRecentSubmissions(recent);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">My Courses</h2>
          <Link to="/create-course" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">+ Create Course</Link>
        </div>
        {myCourses.length > 0 ? (
          <div className="space-y-4">
            {myCourses.map(course => (
              <div key={course.id} className="p-4 border rounded-lg flex justify-between items-center hover:shadow-lg transition-shadow">
                <div>
                    <Link to={`/courses/${course.id}`} className="font-semibold text-blue-600 hover:underline">{course.title}</Link>
                    <p className="text-sm text-gray-500">{course.enrolledStudentIds.length} student(s) enrolled</p>
                </div>
                <Link to={`/courses/${course.id}`} className="text-sm text-blue-500 hover:underline">Manage</Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any courses yet. Get started by creating one!</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Recent Submissions</h2>
        {recentSubmissions.length > 0 ? (
          <ul className="space-y-3">
            {recentSubmissions.map(sub => (
              <li key={sub.id}>
                <p className="font-medium text-gray-800">{sub.studentName}</p>
                <p className="text-sm text-gray-500">Submitted to assignment ID: {sub.assignmentId}</p>
                <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent submissions.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;