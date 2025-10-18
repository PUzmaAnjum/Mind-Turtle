import { MOCK_COURSES, MOCK_USERS, MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, MOCK_MATERIALS, MOCK_FORUM_POSTS, MOCK_TODOS, MOCK_NOTIFICATIONS, MOCK_ASSIGNMENT_TEMPLATES } from '../constants/mockData';
import { User, UserRole, Course, Assignment, Submission, CourseMaterial, ForumPost, Todo, Notification, AssignmentTemplate } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let users = [...MOCK_USERS];
let courses = [...MOCK_COURSES];
let assignments = [...MOCK_ASSIGNMENTS];
let submissions = [...MOCK_SUBMISSIONS];
let materials = [...MOCK_MATERIALS];
let forumPosts = [...MOCK_FORUM_POSTS];
let todos = [...MOCK_TODOS];
let notifications = [...MOCK_NOTIFICATIONS];
let assignmentTemplates = [...MOCK_ASSIGNMENT_TEMPLATES];

export const api = {
  // Auth
  login: async (email: string, pass: string): Promise<User | null> => {
    await delay(500);
    const user = users.find(u => u.email === email);
    if (user) return user; // In a real app, you'd check the password hash
    return null;
  },

  register: async (name: string, email: string, pass: string, role: UserRole): Promise<User | null> => {
    await delay(500);
    if (users.some(u => u.email === email)) {
      return null; // User already exists
    }
    const newUser: User = { id: `user-${Date.now()}`, name, email, role };
    users.push(newUser);
    return newUser;
  },

  // Users
  getUsersByIds: async (ids: string[]): Promise<User[]> => {
    await delay(100);
    return users.filter(u => ids.includes(u.id));
  },

  // Courses
  getCourses: async (): Promise<Course[]> => {
    await delay(300);
    // Augment course data with item counts for progress tracking
    return courses.map(course => ({
      ...course,
      assignmentCount: assignments.filter(a => a.courseId === course.id).length,
      materialCount: materials.filter(m => m.courseId === course.id).length,
    }));
  },
  
  getCourseById: async (id: string): Promise<Course | undefined> => {
    await delay(300);
    return courses.find(c => c.id === id);
  },

  createCourse: async (courseData: Omit<Course, 'id' | 'enrolledStudentIds' | 'assignmentCount' | 'materialCount'>): Promise<Course> => {
    await delay(500);
    const newCourse: Course = { ...courseData, id: `course-${Date.now()}`, enrolledStudentIds: [] };
    courses.push(newCourse);
    return newCourse;
  },
  
  enrollInCourse: async (courseId: string, studentId: string): Promise<boolean> => {
    await delay(400);
    const course = courses.find(c => c.id === courseId);
    if (course && !course.enrolledStudentIds.includes(studentId)) {
      course.enrolledStudentIds.push(studentId);
      return true;
    }
    return false;
  },
  
  // Assignments & Submissions
  getAssignmentById: async (id: string): Promise<Assignment | undefined> => {
    await delay(300);
    return assignments.find(a => a.id === id);
  },

  createAssignment: async (assignmentData: Omit<Assignment, 'id'>): Promise<Assignment> => {
    await delay(500);
    const newAssignment: Assignment = { ...assignmentData, id: `assign-${Date.now()}` };
    assignments.push(newAssignment);
    return newAssignment;
  },

  getAssignmentsByCourse: async (courseId: string): Promise<Assignment[]> => {
    await delay(300);
    return assignments.filter(a => a.courseId === courseId);
  },

  getSubmissionsByAssignment: async (assignmentId: string): Promise<Submission[]> => {
    await delay(300);
    return submissions.filter(s => s.assignmentId === assignmentId);
  },

  getSubmissionsByStudent: async (studentId: string): Promise<Submission[]> => {
      await delay(400);
      return submissions.filter(s => s.studentId === studentId);
  },

  getAssignmentsByStudent: async (studentId: string): Promise<Assignment[]> => {
      await delay(400);
      const enrolledCourses = courses.filter(c => c.enrolledStudentIds.includes(studentId));
      const enrolledCourseIds = enrolledCourses.map(c => c.id);
      return assignments.filter(a => enrolledCourseIds.includes(a.courseId));
  },

  submitAssignment: async (submissionData: Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'studentName' | 'feedback'>, studentName: string): Promise<Submission> => {
    await delay(500);
    const newSubmission: Submission = { ...submissionData, studentName, id: `sub-${Date.now()}`, submittedAt: new Date().toISOString(), grade: null };
    submissions.push(newSubmission);
    // Remove existing submission if any
    const existingIndex = submissions.findIndex(s => s.assignmentId === submissionData.assignmentId && s.studentId === submissionData.studentId && s.id !== newSubmission.id);
    if(existingIndex > -1) submissions.splice(existingIndex, 1);
    
    return newSubmission;
  },

  gradeSubmission: async(submissionId: string, grade: number, feedback: string): Promise<Submission | undefined> => {
    await delay(500);
    const submission = submissions.find(s => s.id === submissionId);
    if(submission) {
        submission.grade = grade;
        submission.feedback = feedback;
        return submission;
    }
    return undefined;
  },
  
  // Assignment Templates
  getAssignmentTemplatesByTeacher: async (teacherId: string): Promise<AssignmentTemplate[]> => {
    await delay(200);
    return assignmentTemplates.filter(t => t.teacherId === teacherId);
  },

  createAssignmentTemplate: async (templateData: Omit<AssignmentTemplate, 'id'>): Promise<AssignmentTemplate> => {
    await delay(300);
    const newTemplate: AssignmentTemplate = { ...templateData, id: `template-${Date.now()}` };
    assignmentTemplates.push(newTemplate);
    return newTemplate;
  },

  // Others
  getMaterialsByCourse: async (courseId: string): Promise<CourseMaterial[]> => {
      await delay(200);
      return materials.filter(m => m.courseId === courseId);
  },
  createMaterial: async (materialData: Omit<CourseMaterial, 'id'>): Promise<CourseMaterial> => {
    await delay(300);
    const newMaterial: CourseMaterial = { ...materialData, id: `mat-${Date.now()}` };
    materials.push(newMaterial);
    return newMaterial;
  },
  getForumPostsByCourse: async (courseId: string): Promise<ForumPost[]> => {
      await delay(400);
      return forumPosts.filter(p => p.courseId === courseId);
  },
  
  getTodos: async (userId: string): Promise<Todo[]> => {
      await delay(200);
      return todos.filter(t => t.userId === userId);
  },
  
  addTodo: async(userId: string, text: string): Promise<Todo> => {
      await delay(300);
      const newTodo: Todo = { id: `todo-${Date.now()}`, userId, text, completed: false };
      todos.push(newTodo);
      return newTodo;
  },

  toggleTodo: async(todoId: string): Promise<Todo | undefined> => {
    await delay(100);
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      return todo;
    }
    return undefined;
  },

  deleteTodo: async(todoId: string): Promise<boolean> => {
    await delay(100);
    const index = todos.findIndex(t => t.id === todoId);
    if (index > -1) {
      todos.splice(index, 1);
      return true;
    }
    return false;
  },

  getNotifications: async (userId: string): Promise<Notification[]> => {
    await delay(200);
    return notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

};