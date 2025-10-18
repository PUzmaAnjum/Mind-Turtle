import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import { UserRole, CourseMaterial } from '../types';
import { TrashIcon } from '../constants/icons';

type NewMaterial = Omit<CourseMaterial, 'id' | 'courseId'>;

const CreateCoursePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [materials, setMaterials] = useState<NewMaterial[]>([]);

    // New material form state
    const [newMaterialName, setNewMaterialName] = useState('');
    const [newMaterialType, setNewMaterialType] = useState<'Link' | 'PDF' | 'PPT'>('Link');
    const [newMaterialUrl, setNewMaterialUrl] = useState('');
    const [newMaterialFile, setNewMaterialFile] = useState<File | null>(null);
    
    // Control state
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiTitle, setAiTitle] = useState('');
    const [error, setError] = useState('');

    if (!user || user.role !== UserRole.Teacher) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-300">You must be a teacher to create courses.</p>
            </div>
        );
    }
    
    const handleGenerateWithAI = async () => {
        if (!aiTitle.trim()) {
            setError("Please enter a course title for AI generation.");
            return;
        }
        setError('');
        setAiLoading(true);
        setTitle(aiTitle);
        const result = await geminiService.generateCourseDetails(aiTitle);
        if (result && !result.error) {
            setDescription(result.description || '');
            setDuration(result.duration || '');
        } else {
            setError(result.error || "Failed to generate course details with AI.");
        }
        setAiLoading(false);
    };

    const handleAddMaterial = () => {
        if (!newMaterialName.trim()) {
            alert('Please provide a name for the material.');
            return;
        }
        if(newMaterialType === 'Link' && !newMaterialUrl.trim()){
            alert('Please provide a URL for the link material.');
            return;
        }
        if(newMaterialType !== 'Link' && !newMaterialFile){
            alert('Please select a file to upload.');
            return;
        }

        const materialToAdd: NewMaterial = {
            name: newMaterialName,
            type: newMaterialType,
            url: newMaterialType === 'Link' ? newMaterialUrl : `#` // Mock URL for file uploads
        };

        setMaterials([...materials, materialToAdd]);
        
        // Reset fields
        setNewMaterialName('');
        setNewMaterialType('Link');
        setNewMaterialUrl('');
        setNewMaterialFile(null);
        // Also reset file input visually if possible (difficult to do reliably)
    };

    const handleRemoveMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !duration.trim()) {
            setError("Please fill in all course details.");
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            const newCourse = await api.createCourse({
                title,
                description,
                duration,
                teacherId: user.id,
                teacherName: user.name
            });

            // After course is created, add materials
            for (const material of materials) {
                await api.createMaterial({
                    courseId: newCourse.id,
                    ...material
                });
            }

            alert("Course created successfully!");
            navigate('/dashboard');

        } catch (err) {
            setError("Failed to create course. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create a New Course</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Generate with AI</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Provide a title and let AI help you craft a description and suggest a duration.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="e.g., 'Advanced JavaScript'"
                        value={aiTitle}
                        onChange={(e) => setAiTitle(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    />
                    <button onClick={handleGenerateWithAI} disabled={aiLoading} className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 font-semibold disabled:bg-gray-400">
                        {aiLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 space-y-6">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Course Details</h2>
                
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"/>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"/>
                </div>

                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                    <input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required placeholder="e.g., 8 weeks" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"/>
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Course Materials</h3>
                    <div className="space-y-4 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Material Name" value={newMaterialName} onChange={e => setNewMaterialName(e.target.value)} className="md:col-span-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                            <select value={newMaterialType} onChange={e => setNewMaterialType(e.target.value as any)} className="md:col-span-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                                <option value="Link">Link</option>
                                <option value="PDF">PDF</option>
                                <option value="PPT">PPT</option>
                            </select>
                        </div>
                         { newMaterialType === 'Link' ? (
                            <input type="text" placeholder="URL or link" value={newMaterialUrl} onChange={e => setNewMaterialUrl(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                         ) : (
                            <input type="file" onChange={e => setNewMaterialFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"/>
                         ) }
                        <button type="button" onClick={handleAddMaterial} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">Add Material</button>
                    </div>

                    <ul className="mt-4 space-y-2">
                        {materials.map((mat, index) => (
                            <li key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <span className="text-sm text-gray-800 dark:text-gray-200">{mat.name} ({mat.type})</span>
                                <button type="button" onClick={() => handleRemoveMaterial(index)} className="text-red-500 hover:text-red-700">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400">
                        {loading ? 'Creating Course...' : 'Create Course'}
                    </button>
                </div>
            </form>

        </div>
    );
};

export default CreateCoursePage;