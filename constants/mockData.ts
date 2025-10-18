
import { User, UserRole, Course, Assignment, Submission, CourseMaterial, ForumPost, Todo, Notification, AssignmentTemplate } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'teacher@example.com', role: UserRole.Teacher },
  { id: 'user-2', name: 'Bob Williams', email: 'student@example.com', role: UserRole.Student },
  { id: 'user-3', name: 'Charlie Brown', email: 'student2@example.com', role: UserRole.Student },
];

export const MOCK_COURSES: Course[] = [
  { id: 'course-1', title: 'Introduction to React', description: 'Learn the fundamentals of React, including components, hooks, and state management.', duration: '8 weeks', teacherId: 'user-1', teacherName: 'Alice Johnson', enrolledStudentIds: ['user-2', 'user-3'] },
  { id: 'course-2', title: 'Advanced Tailwind CSS', description: 'Master responsive design and utility-first styling with advanced Tailwind CSS techniques.', duration: '6 weeks', teacherId: 'user-1', teacherName: 'Alice Johnson', enrolledStudentIds: ['user-2'] },
  { id: 'course-3', title: 'Full-Stack Development with Node.js', description: 'Build complete web applications from front to back using the MERN stack.', duration: '12 weeks', teacherId: 'user-1', teacherName: 'Alice Johnson', enrolledStudentIds: [] },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'assign-1', courseId: 'course-1', title: 'Component Basics', description: 'Create a simple functional component with state.', dueDate: '2024-08-15T23:59:59Z' },
  { id: 'assign-2', courseId: 'course-1', title: 'React Hooks Project', description: 'Build a small application using useState, useEffect, and useContext.', dueDate: '2024-08-30T23:59:59Z' },
  { id: 'assign-3', courseId: 'course-2', title: 'Responsive Layout Challenge', description: 'Recreate a complex responsive layout using Tailwind CSS.', dueDate: '2024-09-05T23:59:59Z' },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: 'sub-1', assignmentId: 'assign-1', studentId: 'user-2', studentName: 'Bob Williams', content: 'Here is my submission for the component basics assignment.', submittedAt: '2024-08-14T10:00:00Z', grade: 95, feedback: 'Excellent work, Bob! Your understanding of component state is very clear.' },
  { id: 'sub-2', assignmentId: 'assign-1', studentId: 'user-3', studentName: 'Charlie Brown', content: 'My first component!', submittedAt: '2024-08-15T11:30:00Z', grade: 88, feedback: 'Good start, Charlie. Try to break down complex components into smaller, reusable ones.' },
];

export const MOCK_MATERIALS: CourseMaterial[] = [
  { id: 'mat-1', courseId: 'course-1', name: 'React Official Docs', type: 'Link', url: 'https://react.dev' },
  { id: 'mat-2', courseId: 'course-1', name: 'Lecture 1 Slides.pdf', type: 'PDF', url: '#' },
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
  { id: 'post-1', courseId: 'course-1', authorId: 'user-2', authorName: 'Bob Williams', content: 'Having trouble with useEffect dependencies. Can anyone help?', createdAt: '2024-08-10T14:00:00Z', replies: [
    { id: 'reply-1', postId: 'post-1', authorId: 'user-1', authorName: 'Alice Johnson', content: 'Great question, Bob! Make sure you only include variables in the dependency array that are used inside the effect and change over time.', createdAt: '2024-08-10T15:00:00Z' }
  ]}
];

export const MOCK_TODOS: Todo[] = [
    { id: 'todo-1', userId: 'user-2', text: 'Finish React component assignment', completed: false },
    { id: 'todo-2', userId: 'user-2', text: 'Study for Tailwind exam', completed: false },
    { id: 'todo-3', userId: 'user-2', text: 'Read Chapter 3', completed: true },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-2', message: 'Your assignment "Component Basics" has been graded.', read: false, createdAt: '2024-08-16T09:00:00Z' },
  { id: 'notif-2', userId: 'user-2', message: 'A new assignment "React Hooks Project" has been posted for Introduction to React.', read: true, createdAt: '2024-08-10T12:00:00Z' },
  { id: 'notif-3', userId: 'user-1', message: 'You have a new submission for "Component Basics" from Charlie Brown.', read: false, createdAt: '2024-08-15T11:31:00Z' },
];

export const MOCK_ASSIGNMENT_TEMPLATES: AssignmentTemplate[] = [
    { id: 'template-1', teacherId: 'user-1', name: 'Weekly Reading Response', title: 'Reading Response - Week X', description: 'Please write a 250-word response to this week\'s reading material. Focus on the main arguments and your own reflections.' },
    { id: 'template-2', teacherId: 'user-1', name: 'Code Challenge', title: 'Code Challenge: [Topic]', description: 'Solve the following coding problem. Please submit your solution as a link to your GitHub repository.' },
];
