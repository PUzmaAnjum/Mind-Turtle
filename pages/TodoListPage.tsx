
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Todo } from '../types';

const TodoListPage: React.FC = () => {
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.getTodos(user.id).then(data => {
                setTodos(data);
                setLoading(false);
            });
        }
    }, [user]);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodoText.trim() === '' || !user) return;

        const newTodo = await api.addTodo(user.id, newTodoText);
        setTodos([...todos, newTodo]);
        setNewTodoText('');
    };
    
    const handleToggleTodo = async (todoId: string) => {
        const updatedTodo = await api.toggleTodo(todoId);
        if (updatedTodo) {
            setTodos(todos.map(t => t.id === todoId ? updatedTodo : t));
        }
    };
    
    const handleDeleteTodo = async (todoId: string) => {
        const success = await api.deleteTodo(todoId);
        if (success) {
            setTodos(todos.filter(t => t.id !== todoId));
        }
    }

    if (loading) return <p>Loading your tasks...</p>;
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">My To-Do List</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <form onSubmit={handleAddTodo} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold">
                        Add
                    </button>
                </form>
                
                <ul className="space-y-3">
                    {todos.map(todo => (
                        <li key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={todo.completed} 
                                    onChange={() => handleToggleTodo(todo.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`ml-3 text-gray-700 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                                    {todo.text}
                                </span>
                           </div>
                           <button onClick={() => handleDeleteTodo(todo.id)} className="text-red-500 hover:text-red-700 font-bold">
                                &times;
                           </button>
                        </li>
                    ))}
                </ul>
                {todos.length === 0 && <p className="text-center text-gray-500 mt-4">No tasks yet. Add one to get started!</p>}
            </div>
        </div>
    );
};

export default TodoListPage;
