import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Assignment, Submission, UserRole } from '../types';

const AssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!assignmentId || !user) return;
    setLoading(true);
    setError('');
    try {
      const assignmentData = await api.getAssignmentById(assignmentId);
      if (!assignmentData) {
        setError("Assignment not found.");
        setLoading(false);
        return;
      }
      setAssignment(assignmentData);

      if (user.role === UserRole.Teacher) {
        const submissionsData = await api.getSubmissionsByAssignment(assignmentId);
        setSubmissions(submissionsData);
      } else {
        const allMySubmissions = await api.getSubmissionsByStudent(user.id);
        const currentSubmission = allMySubmissions.find(s => s.assignmentId === assignmentId) || null;
        setMySubmission(currentSubmission);
      }
    } catch (e) {
      setError("Failed to fetch assignment data.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId, user]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGradeChange = (submissionId: string, value: string) => {
    setGrades(prev => ({ ...prev, [submissionId]: value }));
  };

  const handleFeedbackChange = (submissionId: string, value: string) => {
    setFeedbacks(prev => ({ ...prev, [submissionId]: value }));
  };

  const handleGradeSubmit = async (submissionId: string) => {
    const grade = parseInt(grades[submissionId] || '');
    const feedback = feedbacks[submissionId] || submissions.find(s => s.id === submissionId)?.feedback || '';
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert("Please enter a valid grade between 0 and 100.");
      return;
    }
    const updatedSubmission = await api.gradeSubmission(submissionId, grade, feedback);
    if(updatedSubmission) {
        alert("Grade and feedback saved!");
        fetchData(); // Refresh data
    } else {
        alert("Failed to save grade.");
    }
  };

  const handleStudentSubmit = async () => {
    if (!submissionContent.trim() || !assignmentId || !user) {
        alert("Please enter your submission content.");
        return;
    }
    await api.submitAssignment({
        assignmentId,
        studentId: user.id,
        content: submissionContent,
    }, user.name);
    alert("Assignment submitted successfully!");
    fetchData(); // Refresh to show the submission
  }
  
  if (loading) return <div className="text-center p-8">Loading assignment...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!assignment) return <div className="text-center p-8">Assignment could not be loaded.</div>;

  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{assignment.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Due: {new Date(assignment.dueDate).toLocaleString()}</p>
            <p className="mt-4 text-gray-700 dark:text-gray-300">{assignment.description}</p>
        </div>
        
        {user?.role === UserRole.Teacher && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Submissions ({submissions.length})</h2>
                {submissions.length > 0 ? (
                    <div className="space-y-4">
                        {submissions.map(sub => (
                            <div key={sub.id} className="p-4 border dark:border-gray-700 rounded-lg">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{sub.studentName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                <p className="my-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-gray-700 dark:text-gray-300">{sub.content}</p>
                                
                                {sub.grade !== null ? (
                                    <div className="mt-2">
                                        <p className="font-bold text-green-600">Graded: {sub.grade}%</p>
                                        {sub.feedback && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic">"{sub.feedback}"</p>}
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-2">
                                        <textarea 
                                            placeholder="Provide feedback..."
                                            value={feedbacks[sub.id] || sub.feedback || ''}
                                            onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                            rows={3}
                                        />
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="number" 
                                                min="0" max="100" 
                                                placeholder="Grade %"
                                                value={grades[sub.id] || ''}
                                                onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                                                className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                            />
                                            <button onClick={() => handleGradeSubmit(sub.id)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                                                Save Grade
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No submissions for this assignment yet.</p>
                )}
            </div>
        )}

        {user?.role === UserRole.Student && (
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">My Submission</h2>
                {mySubmission ? (
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">Status: Submitted</p>
                        
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <p className="text-gray-700 dark:text-gray-300">{mySubmission.content}</p>
                        </div>

                        {mySubmission.grade !== null ? (
                            <>
                                <p className="font-bold text-green-600 mt-4">Grade: {mySubmission.grade}%</p>
                                {mySubmission.feedback && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border-l-4 border-blue-500">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">Teacher Feedback:</p>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1">{mySubmission.feedback}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-yellow-600 mt-4">Not graded yet.</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <textarea 
                            rows={8}
                            value={submissionContent}
                            onChange={(e) => setSubmissionContent(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                            placeholder="Enter your assignment submission here..."
                        />
                        <button onClick={handleStudentSubmit} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                            Submit Assignment
                        </button>
                    </div>
                )}
            </div>
        )}

    </div>
  );
};

export default AssignmentPage;