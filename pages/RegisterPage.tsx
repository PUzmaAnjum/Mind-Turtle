import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { TurtleIcon } from '../constants/icons';

const PasswordStrengthMeter: React.FC<{ score: number; recommendations: string[] }> = ({ score, recommendations }) => {
    const strengthLevels = [
        { text: 'Weak', color: 'bg-red-500' },
        { text: 'Fair', color: 'bg-orange-500' },
        { text: 'Good', color: 'bg-yellow-500' },
        { text: 'Strong', color: 'bg-green-500' },
    ];

    const currentStrength = strengthLevels[score] || strengthLevels[0];

    return (
        <div className="mt-2 space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`${currentStrength.color} h-2.5 rounded-full`} style={{ width: `${(score + 1) * 25}%` }}></div>
            </div>
            <p className="text-sm text-right font-medium text-gray-700 dark:text-gray-300">{currentStrength.text}</p>
            {recommendations.length > 0 && score < 3 && (
                <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1">
                    {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};


const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordCheck = useMemo(() => {
    let score = -1;
    const recommendations: string[] = [];
    
    if(!password) return { score, recommendations };

    if (password.length >= 8) {
      score++;
    } else {
      recommendations.push("Use at least 8 characters.");
    }
    if (/\d/.test(password)) {
      score++;
    } else {
      recommendations.push("Include at least one number.");
    }
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      recommendations.push("Include at least one uppercase letter.");
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    } else {
      recommendations.push("Include at least one special character (e.g., !@#$).");
    }
    
    // Ensure score is not negative if password is empty
    return { score: Math.max(0, score), recommendations };
  }, [password]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (passwordCheck.score < 3) {
        setError('Please choose a stronger password.');
        return;
    }
    try {
      const newUser = await register(name, email, password, role);
      if (newUser) {
        navigate('/dashboard');
      } else {
        setError('An account with this email already exists.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 text-teal-500 flex items-center justify-center">
             <TurtleIcon className="h-16 w-16" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your MindTurtle account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <input name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border-b-0 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div>
              <input name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border-b-0 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {password && <PasswordStrengthMeter score={passwordCheck.score} recommendations={passwordCheck.recommendations} />}
            </div>
            <select name="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 bg-white placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value={UserRole.Student}>I am a Student</option>
                <option value={UserRole.Teacher}>I am a Teacher</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Create Account
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
            <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

// FIX: Add default export to resolve "Module has no default export" error.
export default RegisterPage;
