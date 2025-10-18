import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Submission, Course, Assignment } from '../types';

interface GradedSubmission extends Submission {
    courseTitle: string;
    assignmentTitle: string;
}

const GradesPage: React.FC = () => {
    const { user } = useAuth();
    const [gradedSubmissions, setGradedSubmissions] = useState<GradedSubmission[]>([]);
    const [averageGrade, setAverageGrade] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);

            const [submissions, courses, assignments] = await Promise.all([
                api.getSubmissionsByStudent(user.id),
                api.getCourses(),
                api.getAssignmentsByStudent(user.id)
            ]);

            const coursesMap = new Map(courses.map(c => [c.id, c.title]));
            const assignmentsMap = new Map(assignments.map(a => [a.id, {title: a.title, courseId: a.courseId}]));

            const graded = submissions
                .filter(s => s.grade !== null)
                .map(s => ({
                    ...s,
                    assignmentTitle: assignmentsMap.get(s.assignmentId)?.title || 'Unknown Assignment',
                    courseTitle: coursesMap.get(assignmentsMap.get(s.assignmentId)?.courseId || '') || 'Unknown Course',
                }));
            
            setGradedSubmissions(graded);

            if (graded.length > 0) {
                const total = graded.reduce((sum, s) => sum + s.grade!, 0);
                setAverageGrade(Math.round(total / graded.length));
            }
            
            setLoading(false);
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="text-center p-8">Loading grades...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Grades</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Here's an overview of your academic performance.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                <p className="text-lg text-gray-500 dark:text-gray-400">Overall Average Grade</p>
                <p className={`text-6xl font-bold mt-2 ${averageGrade >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>{averageGrade}%</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Grade Details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Course</th>
                                <th scope="col" className="px-6 py-3">Assignment</th>
                                <th scope="col" className="px-6 py-3 text-right">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradedSubmissions.map(s => (
                                <tr key={s.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{s.courseTitle}</td>
                                    <td className="px-6 py-4">{s.assignmentTitle}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-gray-200">{s.grade}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {gradedSubmissions.length === 0 && <p className="p-6 text-center text-gray-500">No grades have been recorded yet.</p>}
            </div>
        </div>
    );
};

export default GradesPage;
