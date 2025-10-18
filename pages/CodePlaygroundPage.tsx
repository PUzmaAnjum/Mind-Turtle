
import React, { useState } from 'react';

const CodePlaygroundPage: React.FC = () => {
    const [code, setCode] = useState('// Welcome to the MindTurtle Code Playground!\n// Write your JavaScript code here and see the output in the console.\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Developer"));');
    const [output, setOutput] = useState('');

    const runCode = () => {
        let capturedOutput = '';
        const originalLog = console.log;
        
        console.log = (...args) => {
            capturedOutput += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n';
        };

        try {
            // Using Function constructor for safer evaluation than eval()
            new Function(code)();
            setOutput(capturedOutput || 'Code executed successfully with no console output.');
        } catch (error: any) {
            setOutput(`Error: ${error.message}`);
        } finally {
            console.log = originalLog;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Code Playground</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-t-lg">
                        <span className="text-sm font-semibold text-gray-300">JavaScript Editor</span>
                        <button onClick={runCode} className="bg-teal-500 text-white px-4 py-1 rounded hover:bg-teal-600 text-sm font-medium">
                            Run Code
                        </button>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-96 bg-gray-900 text-green-400 p-4 font-mono text-sm border-none focus:ring-0 resize-none rounded-b-lg"
                        spellCheck="false"
                    />
                </div>
                <div className="bg-gray-100 rounded-lg shadow-lg">
                     <div className="p-3 bg-gray-200 rounded-t-lg">
                        <span className="text-sm font-semibold text-gray-700">Output / Console</span>
                    </div>
                    <pre className="w-full h-96 bg-white text-gray-800 p-4 font-mono text-sm overflow-auto rounded-b-lg">
                        {output}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default CodePlaygroundPage;
