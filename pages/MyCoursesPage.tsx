
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useCourseProgress } from '../hooks/useCourseProgress';

const MyCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { getCompletionPercentage } = useCourseProgress();

    useEffect(() => {
        if (user) {
            api.getCourses().then(allCourses => {
                const myEnrolledCourses = allCourses.filter(c => c.enrolledStudentIds.includes(user.id));
                setCourses(myEnrolledCourses);
                setLoading(false);
            });
        }
    }, [user]);

    if (loading) return <p>Loading your courses...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Enrolled Courses</h1>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => {
                        const progress = getCompletionPercentage(course);
                        return (
                            <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                <img className="h-40 w-full object-cover" src={`https://picsum.photos/seed/${course.id}/400/200`} alt={course.title} />
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">Taught by {course.teacherName}</p>
                                    
                                    <div className="mt-auto">
                                        <div className="mb-4">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                                <span className="text-sm font-medium text-blue-700">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                        <Link to={`/courses/${course.id}`} className="w-full text-center block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                            Go to Course
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                    <p className="text-gray-600">You are not enrolled in any courses yet.</p>
                    <Link to="/courses" className="mt-4 inline-block bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600">
                        Browse Available Courses
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;
