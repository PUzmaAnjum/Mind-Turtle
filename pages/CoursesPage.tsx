
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const CourseCard: React.FC<{ course: Course, onEnroll: (courseId: string) => void, isEnrolled: boolean }> = ({ course, onEnroll, isEnrolled }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <img className="h-40 w-full object-cover" src={`https://picsum.photos/seed/${course.id}/400/200`} alt={course.title} />
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>by {course.teacherName}</span>
                    <span>{course.duration}</span>
                </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-between items-center">
                <Link to={`/courses/${course.id}`} className="text-blue-500 font-semibold hover:underline">View Details</Link>
                {isEnrolled ? (
                     <span className="text-green-600 font-semibold">Enrolled</span>
                ) : (
                    <button onClick={() => onEnroll(course.id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Enroll Now
                    </button>
                )}
            </div>
        </div>
    )
}

const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    useEffect(() => {
        api.getCourses().then(data => {
            setCourses(data);
            setLoading(false);
        });
    }, []);

    const handleEnroll = async (courseId: string) => {
        if (!user || user.role !== UserRole.Student) {
            alert("Only students can enroll in courses.");
            return;
        }
        const success = await api.enrollInCourse(courseId, user.id);
        if (success) {
            alert("Successfully enrolled!");
            // Re-fetch courses to update enrollment status
            api.getCourses().then(setCourses);
        } else {
            alert("Enrollment failed. You might already be enrolled.");
        }
    };

    if (loading) return <p>Loading courses...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <CourseCard 
                        key={course.id} 
                        course={course}
                        onEnroll={handleEnroll}
                        isEnrolled={user ? course.enrolledStudentIds.includes(user.id) : false}
                    />
                ))}
            </div>
        </div>
    );
};

export default CoursesPage;
