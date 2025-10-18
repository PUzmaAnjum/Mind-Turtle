import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Course, Assignment, Submission, User, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

interface AssignmentStat {
    id: string;
    title: string;
    submissions: number;
    averageGrade: number | null;
    highestGrade: number | null;
    lowestGrade: number | null;
}

interface StudentStat {
    id: string;
    name: string;
    averageGrade: number | null;
    submittedCount: number;
}


const ScoreboardPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!courseId) return;
            setLoading(true);

            try {
                const courseData = await api.getCourseById(courseId);
                if (!courseData) {
                    setLoading(false);
                    return;
                }
                setCourse(courseData);

                const studentData = await api.getUsersByIds(courseData.enrolledStudentIds);
                setEnrolledStudents(studentData);
                
                const assignmentData = await api.getAssignmentsByCourse(courseId);
                setAssignments(assignmentData);

                const submissionPromises = assignmentData.map(a => api.getSubmissionsByAssignment(a.id));
                const submissionsByAssignment = await Promise.all(submissionPromises);
                setSubmissions(submissionsByAssignment.flat());

            } catch (error) {
                console.error("Failed to fetch scoreboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);
    
    const assignmentStats: AssignmentStat[] = useMemo(() => {
        return assignments.map(assignment => {
            const relevantSubmissions = submissions.filter(s => s.assignmentId === assignment.id && s.grade !== null);
            const grades = relevantSubmissions.map(s => s.grade!);
            
            if(grades.length === 0) {
                return { id: assignment.id, title: assignment.title, submissions: 0, averageGrade: null, highestGrade: null, lowestGrade: null };
            }

            const averageGrade = Math.round(grades.reduce((sum, g) => sum + g, 0) / grades.length);
            const highestGrade = Math.max(...grades);
            const lowestGrade = Math.min(...grades);

            return { id: assignment.id, title: assignment.title, submissions: grades.length, averageGrade, highestGrade, lowestGrade };
        });
    }, [assignments, submissions]);

    const studentStats: StudentStat[] = useMemo(() => {
        return enrolledStudents.map(student => {
            const studentSubmissions = submissions.filter(s => s.studentId === student.id && s.grade !== null);
            const grades = studentSubmissions.map(s => s.grade!);

            if(grades.length === 0) {
                return { id: student.id, name: student.name, averageGrade: null, submittedCount: 0 };
            }
            
            const averageGrade = Math.round(grades.reduce((sum, g) => sum + g, 0) / grades.length);

            return { id: student.id, name: student.name, averageGrade, submittedCount: grades.length };
        })
    }, [enrolledStudents, submissions]);


    if (loading) return <div className="text-center p-8">Loading scoreboard...</div>;
    if (!course || user?.role !== UserRole.Teacher) return <div className="text-center p-8 text-red-500">Access Denied or Course Not Found.</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Scoreboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Performance analysis for <span className="font-semibold">{course.title}</span></p>
            </div>
            
            {/* Assignment Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700"><h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Assignment Analytics</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Assignment</th>
                                <th className="px-6 py-3 text-center">Submissions</th>
                                <th className="px-6 py-3 text-center">Avg. Grade</th>
                                <th className="px-6 py-3 text-center">Highest</th>
                                <th className="px-6 py-3 text-center">Lowest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignmentStats.map(stat => (
                                <tr key={stat.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{stat.title}</td>
                                    <td className="px-6 py-4 text-center">{stat.submissions}</td>
                                    <td className="px-6 py-4 text-center font-semibold">{stat.averageGrade !== null ? `${stat.averageGrade}%` : 'N/A'}</td>
                                    <td className="px-6 py-4 text-center text-green-500">{stat.highestGrade !== null ? `${stat.highestGrade}%` : 'N/A'}</td>
                                    <td className="px-6 py-4 text-center text-red-500">{stat.lowestGrade !== null ? `${stat.lowestGrade}%` : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Performance */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700"><h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Student Performance</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Student Name</th>
                                <th className="px-6 py-3 text-center">Graded Assignments</th>
                                <th className="px-6 py-3 text-center">Average Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentStats.map(stat => (
                                <tr key={stat.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{stat.name}</td>
                                    <td className="px-6 py-4 text-center">{stat.submittedCount} / {assignments.length}</td>
                                    <td className="px-6 py-4 text-center font-bold text-lg">{stat.averageGrade !== null ? `${stat.averageGrade}%` : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ScoreboardPage;