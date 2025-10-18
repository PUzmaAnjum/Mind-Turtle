import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Assignment, Submission } from '../types';
import { Link } from 'react-router-dom';

const AllAssignmentsPage: React.FC = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);
            const [assignmentData, submissionData] = await Promise.all([
                api.getAssignmentsByStudent(user.id),
                api.getSubmissionsByStudent(user.id)
            ]);
            setAssignments(assignmentData.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
            setSubmissions(submissionData);
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const submittedIds = new Set(submissions.map(s => s.assignmentId));
    const pendingAssignments = assignments.filter(a => !submittedIds.has(a.id));
    const completedAssignments = assignments.filter(a => submittedIds.has(a.id));

    if (loading) return <div className="text-center p-8">Loading assignments...</div>;
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">All Assignments</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Here's a list of all your assignments across all courses.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Pending ({pendingAssignments.length})</h2>
                {pendingAssignments.length > 0 ? (
                    <ul className="space-y-3">
                        {pendingAssignments.map(a => (
                            <li key={a.id} className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center">
                                <div>
                                    <Link to={`/courses/${a.courseId}/assignments/${a.id}`} className="font-semibold text-blue-600 hover:underline">{a.title}</Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                                </div>
                                <Link to={`/courses/${a.courseId}/assignments/${a.id}`} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                                    View
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No pending assignments. You're all caught up!</p>
                )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Completed ({completedAssignments.length})</h2>
                 {completedAssignments.length > 0 ? (
                    <ul className="space-y-3">
                        {completedAssignments.map(a => (
                            <li key={a.id} className="p-3 border dark:border-gray-700 rounded-md flex justify-between items-center opacity-70">
                                <div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{a.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status: Submitted</p>
                                </div>
                                <span className="text-sm text-green-600 dark:text-green-400 font-bold">✓ Submitted</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No completed assignments yet.</p>
                )}
            </div>

        </div>
    );
};

export default AllAssignmentsPage;
