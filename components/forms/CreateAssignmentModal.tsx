import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { CloseIcon } from '../../constants/icons';
import { AssignmentTemplate, UserRole } from '../../types';

interface CreateAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onAssignmentCreated: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, courseId, onAssignmentCreated }) => {
    const { user } = useAuth();
    
    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // Template logic state
    const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    
    // Control state
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch templates when the modal is opened for a teacher
        if (isOpen && user && user.role === UserRole.Teacher) {
            api.getAssignmentTemplatesByTeacher(user.id).then(setTemplates);
        }
    }, [isOpen, user]);

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setTitle(template.title);
            setDescription(template.description);
        } else {
            // Reset if they select the default "-- Select a template --" option
            setTitle('');
            setDescription('');
        }
    };
    
    const resetState = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setSaveAsTemplate(false);
        setTemplateName('');
        setSelectedTemplate('');
        setTemplates([]);
        setLoading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !dueDate) {
            alert("Please provide a title and due date.");
            return;
        }
        if (saveAsTemplate && !templateName.trim()) {
            alert("Please provide a name for the new template.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create the assignment
            await api.createAssignment({
                courseId,
                title,
                description,
                dueDate: new Date(dueDate).toISOString()
            });
            
            // 2. Create the template if requested by the user
            if (saveAsTemplate && user) {
                await api.createAssignmentTemplate({
                    teacherId: user.id,
                    name: templateName,
                    title,
                    description
                });
            }
            
            // 3. Callback and close
            onAssignmentCreated();
            handleClose();

        } catch (error) {
            console.error("Failed to create assignment or template:", error);
            alert("Failed to create assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Create New Assignment</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="template" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Use Template (Optional)</label>
                        <select 
                            id="template" 
                            value={selectedTemplate} 
                            onChange={e => handleSelectTemplate(e.target.value)} 
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                            <option value="">-- Select a template --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                        <input type="datetime-local" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                    </div>

                    <div className="border-t dark:border-gray-600 pt-4 mt-4 space-y-4">
                        <div className="flex items-center">
                            <input
                                id="saveAsTemplate"
                                type="checkbox"
                                checked={saveAsTemplate}
                                onChange={e => setSaveAsTemplate(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:bg-gray-700"
                            />
                            <label htmlFor="saveAsTemplate" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Save this assignment as a template
                            </label>
                        </div>
                        {saveAsTemplate && (
                            <div>
                                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                                <input 
                                    type="text" 
                                    id="templateName" 
                                    value={templateName} 
                                    onChange={e => setTemplateName(e.target.value)} 
                                    required={saveAsTemplate} 
                                    placeholder="e.g., 'Weekly Reading Quiz'"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {loading ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignmentModal;