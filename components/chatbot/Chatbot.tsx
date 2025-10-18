
import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon, CloseIcon, SendIcon, TurtleIcon } from '../../constants/icons';
import { geminiService } from '../../services/geminiService';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm MindTurtle AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const aiResponse = await geminiService.sendMessageToChatbot(input);
        const aiMessage: Message = { sender: 'ai', text: aiResponse };
        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        const errorMessage: Message = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none z-50"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <CloseIcon className="h-8 w-8" /> : <ChatIcon className="h-8 w-8" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-40">
          <header className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-t-2xl">
            <div className="flex items-center">
              <TurtleIcon className="h-8 w-8 text-teal-400" />
              <h2 className="text-xl font-bold ml-3">MindTurtle AI</h2>
            </div>
          </header>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="flex flex-col space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-2"><TurtleIcon className="h-5 w-5 text-teal-400"/></div>}
                  <div className={`px-4 py-2 rounded-2xl max-w-xs break-words ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-end justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center mr-2"><TurtleIcon className="h-5 w-5 text-teal-400"/></div>
                    <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                        <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-full px-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-gray-700"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2 text-blue-500 rounded-full disabled:text-gray-400 hover:bg-gray-200">
                <SendIcon className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
