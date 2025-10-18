
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import { Course, Assignment, CourseMaterial, ForumPost, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCourseProgress } from '../hooks/useCourseProgress';
import CreateAssignmentModal from '../components/forms/CreateAssignmentModal';
import { DocumentAddIcon, ChartBarIcon } from '../constants/icons';

type Prerequisite = {
    topic: string;
    description: string;
    youtubeSearchQuery: string;
};

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { getCompletedItems, toggleItemComplete, getCompletionPercentage } = useCourseProgress();

  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [understoodPrereqs, setUnderstoodPrereqs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingPrereqs, setLoadingPrereqs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    // Use getCourses to get the augmented course data with counts
    const allCourses = await api.getCourses();
    const courseData = allCourses.find(c => c.id === courseId);

    if (courseData) {
      setCourse(courseData);
      const [assignmentData, materialData, postData] = await Promise.all([
        api.getAssignmentsByCourse(courseId),
        api.getMaterialsByCourse(courseId),
        api.getForumPostsByCourse(courseId),
      ]);
      setAssignments(assignmentData);
      setMaterials(materialData);
      setPosts(postData);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const fetchPrerequisites = async () => {
      if (!course) return;
      setLoadingPrereqs(true);
      const result = await geminiService.generateCoursePrerequisites(course.title);
      if (result && result.prerequisites) {
          setPrerequisites(result.prerequisites);
      } else {
          console.error("Failed to fetch prerequisites:", result.error);
      }
      setLoadingPrereqs(false);
  }

  const handleMarkAsUnderstood = (topic: string) => {
    setUnderstoodPrereqs(prev => {
        const newSet = new Set(prev);
        newSet.add(topic);
        return newSet;
    });
  };

  const handleAssignmentCreated = () => {
    setIsModalOpen(false);
    fetchCourseData(); // Re-fetch all data to show the new assignment
  }

  if (loading) return <p>Loading course details...</p>;
  if (!course) return <p>Course not found.</p>;

  const progressPercentage = getCompletionPercentage(course);
  const completedItems = getCompletedItems(course.id);

  return (
    <div className="space-y-8">
      {courseId && <CreateAssignmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} courseId={courseId} onAssignmentCreated={handleAssignmentCreated} />}

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{course.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Taught by {course.teacherName}</p>
        <p className="mt-4 text-gray-700 dark:text-gray-300">{course.description}</p>
        
        {user?.role === UserRole.Student && (
          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Assignments */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Assignments</h2>
                {user?.role === UserRole.Teacher && courseId && (
                    <div className="flex items-center gap-4">
                        <Link to={`/courses/${courseId}/scoreboard`} className="flex items-center bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm">
                            <ChartBarIcon className="h-5 w-5 mr-2"/>
                            Scoreboard
                        </Link>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <DocumentAddIcon className="h-5 w-5 mr-2"/>
                            Create Assignment
                        </button>
                    </div>
                )}
            </div>
            {assignments.length > 0 ? (
                <ul className="space-y-3">
                    {assignments.map(a => (
                      <li key={a.id} className="flex items-center">
                        {user?.role === UserRole.Student && (
                          <input 
                            type="checkbox"
                            id={`item-${a.id}`}
                            checked={completedItems.has(a.id)}
                            onChange={() => toggleItemComplete(course.id, a.id)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4 flex-shrink-0"
                          />
                        )}
                        <Link to={`/courses/${courseId}/assignments/${a.id}`} className="text-blue-600 hover:underline">{a.title}</Link>
                      </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500 dark:text-gray-400">No assignments for this course yet.</p>}
          </div>

          {/* Forum */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Discussion Forum</h2>
             {posts.map(post => (
                 <div key={post.id} className="border-b dark:border-gray-700 last:border-b-0 py-4">
                     <p className="font-semibold text-gray-800 dark:text-gray-100">{post.authorName}</p>
                     <p className="text-gray-700 dark:text-gray-300 my-1">{post.content}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                 </div>
             ))}
           </div>
        </div>
        <div className="space-y-8">
            {/* Course Materials */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Materials</h2>
                <div className="space-y-3">
                  {materials.map(m => (
                    <div key={m.id} className="flex items-center">
                      {user?.role === UserRole.Student && (
                          <input 
                            type="checkbox"
                            id={`item-${m.id}`}
                            checked={completedItems.has(m.id)}
                            onChange={() => toggleItemComplete(course.id, m.id)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4 flex-shrink-0"
                          />
                        )}
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{m.name} ({m.type})</a>
                    </div>
                  ))}
                </div>
            </div>
            
            {/* AI Prerequisites */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">AI-Suggested Prerequisites</h2>
                {prerequisites.length > 0 ? (
                    <ul className="space-y-4">
                        {prerequisites.map((p, i) => {
                            const isUnderstood = understoodPrereqs.has(p.topic);
                            return (
                                <li key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{p.topic}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 my-2">{p.description}</p>
                                    <div className="flex items-center space-x-2 mt-3">
                                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(p.youtubeSearchQuery)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors shadow">
                                            Search on YouTube
                                        </a>
                                        <button 
                                            onClick={() => handleMarkAsUnderstood(p.topic)}
                                            disabled={isUnderstood}
                                            className={`flex-1 text-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow ${
                                                isUnderstood 
                                                    ? 'bg-green-500 text-white cursor-not-allowed' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {isUnderstood ? 'Understood ✓' : 'Mark as Understood'}
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <button onClick={fetchPrerequisites} disabled={loadingPrereqs} className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-400">
                        {loadingPrereqs ? 'Generating...' : 'Generate with AI'}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;