
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Course } from '../types';

type ProgressData = {
    [courseId: string]: {
        completedItems: string[];
    }
};

const getProgressFromStorage = (userId: string): ProgressData => {
    try {
        const storedProgress = localStorage.getItem(`mindturtle-progress-${userId}`);
        return storedProgress ? JSON.parse(storedProgress) : {};
    } catch (error) {
        console.error("Failed to parse progress from localStorage", error);
        return {};
    }
};

const setProgressInStorage = (userId: string, progress: ProgressData) => {
    try {
        localStorage.setItem(`mindturtle-progress-${userId}`, JSON.stringify(progress));
    } catch (error) {
        console.error("Failed to save progress to localStorage", error);
    }
};

export const useCourseProgress = () => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<ProgressData>(() => user ? getProgressFromStorage(user.id) : {});

    const updateProgress = useCallback((newProgress: ProgressData) => {
        if (user) {
            setProgress(newProgress);
            setProgressInStorage(user.id, newProgress);
        }
    }, [user]);

    const getCompletedItems = useCallback((courseId: string): Set<string> => {
        return new Set(progress[courseId]?.completedItems || []);
    }, [progress]);

    const toggleItemComplete = useCallback((courseId: string, itemId: string) => {
        if (!user) return;

        const allProgress = getProgressFromStorage(user.id);
        const courseProgress = allProgress[courseId] || { completedItems: [] };
        const completedSet = new Set(courseProgress.completedItems);

        if (completedSet.has(itemId)) {
            completedSet.delete(itemId);
        } else {
            completedSet.add(itemId);
        }

        const newProgress = {
            ...allProgress,
            [courseId]: {
                ...courseProgress,
                completedItems: Array.from(completedSet),
            }
        };
        
        updateProgress(newProgress);

    }, [user, updateProgress]);

    const getCompletionPercentage = useCallback((course: Course | null | undefined): number => {
        if (!course) return 0;
        
        const totalItems = (course.assignmentCount ?? 0) + (course.materialCount ?? 0);
        if (totalItems === 0) return 100; // If no items, course is complete

        const completedItemsCount = getCompletedItems(course.id).size;
        
        return Math.round((completedItemsCount / totalItems) * 100);

    }, [getCompletedItems]);
    
    return {
        progress,
        getCompletedItems,
        toggleItemComplete,
        getCompletionPercentage
    };
};
