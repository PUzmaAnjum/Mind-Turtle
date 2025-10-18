
export enum UserRole {
  Student = 'Student',
  Teacher = 'Teacher',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  teacherId: string;
  teacherName: string;
  enrolledStudentIds: string[];
  assignmentCount?: number;
  materialCount?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  grade: number | null;
  feedback?: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  name: string;
  type: 'Link' | 'PDF' | 'PPT';
  url: string;
}

export interface ForumPost {
    id: string;
    courseId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    replies: Reply[];
}

export interface Reply {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
}

export interface Todo {
    id: string;
    userId: string;
    text: string;
    completed: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface AssignmentTemplate {
    id: string;
    teacherId: string;
    name: string;
    title: string;
    description: string;
}