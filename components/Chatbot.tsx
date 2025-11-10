import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PaperAirplaneIcon, CloseIcon } from './Icons';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const getOfflineResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Greeting
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        return "Hello! I'm the faculty helper, currently in offline mode. I can answer some basic questions about how to use this website.";
    }

    // Help and Capabilities
    if (lowerInput.includes('help') || lowerInput.includes('what can you do') || lowerInput.includes('who are you')) {
        return "I'm the VICK VIT MIS faculty helper. While offline, I can explain how to use the site. You can ask me questions like 'How do I search for a professor?', 'How do I leave a review?', or 'What does a pending review mean?'.";
    }

    // How to search for faculty
    if (lowerInput.includes('find') || lowerInput.includes('search') || (lowerInput.includes('look for') && lowerInput.includes('faculty'))) {
        return "To find a faculty member, use the search bar on the homepage. You can type their name or department. You can also use the filter tags like 'Helpful' or 'Strict' to narrow down your search.";
    }

    // How to leave a review
    if (lowerInput.includes('leave a review') || lowerInput.includes('submit a review') || lowerInput.includes('rate a professor')) {
        return "First, find the faculty member you want to review using the search bar. On their profile page, you can select a star rating and write your comment. You must be logged in to submit a review. After submitting, your review will be 'pending' until an administrator approves it, after which it will be visible to everyone.";
    }
    
    // Understanding Review Status
    if (lowerInput.includes('review status') || lowerInput.includes('pending') || lowerInput.includes('approved') || lowerInput.includes('rejected')) {
        return "After you submit a review, it has a status. 'Pending' means an administrator is still reviewing it. 'Approved' means it's now public on the faculty's profile. 'Rejected' means it didn't meet our guidelines. If you are logged in, you can see your own pending review on the faculty's detail page.";
    }
    
    // How to suggest new faculty
    if (lowerInput.includes('suggest faculty') || lowerInput.includes('add professor') || lowerInput.includes('new faculty')) {
        return "If you can't find a faculty member, you can suggest they be added to the list! Once you are logged in, a 'Suggest New Faculty' button will appear on the homepage. Clicking it will open a form where you can enter their details.";
    }
    
    // How to suggest an update to existing faculty
    if (lowerInput.includes('update faculty') || lowerInput.includes('suggest an edit') || lowerInput.includes('wrong department') || lowerInput.includes('correct information')) {
        return "That's a helpful question! Currently, there isn't a dedicated feature to suggest an edit to a faculty's profile. The best way to do this is to submit a new review for that faculty member and include the correction in your comment. Our administrators will see it during the review process. Thanks for helping us keep the information accurate!";
    }

    // How to navigate the site
    if (lowerInput.includes('navigate') || lowerInput.includes('menu') || lowerInput.includes('find pages')) {
        return "You can navigate the site using the links in the header at the top of the page. You'll find links to 'Home' and 'About'. The 'Student Login' and 'Admin Login' buttons are also in the header to access your account or the admin panel.";
    }

    // Purpose of the site
    if (lowerInput.includes('what is this site') || lowerInput.includes('purpose') || lowerInput.includes('about this site')) {
         return "This platform helps VICK VIT MIS students find, review, and rate faculty members. It's a way for students to share their experiences and help others make informed course decisions.";
    }
    
    // Login/Register
    if (lowerInput.includes('login') || lowerInput.includes('register') || lowerInput.includes('account') || lowerInput.includes('sign in') || lowerInput.includes('sign up')) {
        return "To log in or register as a student, click the 'Student Login' button in the top-right corner. You'll need a valid '@vitstudent.ac.in' email to sign up. If you're an administrator, you can access the admin panel via the 'Admin Login' link.";
    }

    // Admin Panel
    if (lowerInput.includes('admin') || lowerInput.includes('panel') || lowerInput.includes('moderation')) {
        return "The admin panel is for site administrators to manage faculty, students, and review submissions. You can access it via the 'Admin Login' link on the homepage if you have admin credentials.";
    }

    // About Page
    if (lowerInput.includes('who made this') || lowerInput.includes('creator') || lowerInput.includes('about page')) {
        return "This website was created by Vignesh Nagarajan. You can find more information and a link to his LinkedIn profile on the 'About' page, accessible from the navigation bar at the top.";
    }

    // Fallback for more complex queries
    if (lowerInput.includes('faculty') || lowerInput.includes('review') || lowerInput.includes('rating')) {
        return "I can't access specific faculty details or reviews while offline. Please connect to the internet for that information.";
    }

    // Default fallback
    return "I'm sorry, I can't answer that question in offline mode. Please check your internet connection. You can ask 'help' to see what I can do offline.";
};


const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! How can I help you with information about our faculty?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBrowserOffline, setIsBrowserOffline] = useState(!navigator.onLine);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotContainerRef = useRef<HTMLDivElement>(null);

  const isEffectivelyOffline = isBrowserOffline || isApiKeyMissing;

  useEffect(() => {
    const apiKeyIsMissing = !process.env.API_KEY || process.env.API_KEY.startsWith("REPLACE_WITH");
    if (apiKeyIsMissing) {
        setIsApiKeyMissing(true);
        console.warn("Chatbot API key is not configured. The chatbot will run in offline mode.");
    }
    
    if (apiKeyIsMissing || !navigator.onLine) {
        setMessages([{
            sender: 'bot',
            text: "Hello! I'm in offline mode. I can answer basic questions about the site. How can I help?"
        }]);
    }

    const goOnline = () => setIsBrowserOffline(false);
    const goOffline = () => setIsBrowserOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
    };
  }, []);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Close chatbot on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // If browser is offline or API key is missing, use offline mode immediately.
    if (isEffectivelyOffline) {
        setTimeout(() => {
            const botMessage: Message = { text: getOfflineResponse(currentInput), sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
            setIsLoading(false);
        }, 500);
        return;
    }

    try {
      // Initialize the SDK here, only when we are online and have a key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `You are a helpful assistant for a university's faculty review website. Answer questions about faculty, courses, and reviews based on general knowledge. Keep your answers concise and friendly. User question: "${currentInput}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const botMessage: Message = { text: response.text, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with Gemini API:', error);
      // If the API call fails (e.g., invalid key), treat it as an offline scenario.
      // This provides a graceful fallback.
      const offlineResponseMessage = getOfflineResponse(currentInput);
      const errorMessage: Message = { 
          text: `I'm having trouble connecting to my brain right now. ${offlineResponseMessage}`, 
          sender: 'bot' 
      };
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
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50 animate-pulse"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.352 0 9.75-2.903 9.75-6.5s-4.398-6.5-9.75-6.5c-5.352 0-9.75 2.903-9.75 6.5 0 1.909.992 3.646 2.604 4.881.456.383.82.825 1.14 1.309a6.707 6.707 0 01-1.14.004zM12 15.75a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 013 0v2.25a1.5 1.5 0 01-1.5 1.5zm-3.375-4.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25zM15.375 9a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
        </svg>
        }
      </button>

      {isOpen && (
        <div 
            ref={chatbotContainerRef}
            className="fixed bottom-24 right-8 w-full max-w-sm bg-white rounded-lg shadow-xl border z-50 flex flex-col"
            role="dialog"
            aria-modal="false"
            aria-labelledby="chatbot-header"
        >
          <header className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 id="chatbot-header" className="font-bold">Faculty Helper</h3>
            {isEffectivelyOffline && (
                <span className="text-xs bg-yellow-400 text-gray-800 font-semibold px-2 py-0.5 rounded-full">Offline Mode</span>
            )}
          </header>
          <div role="log" aria-live="polite" className="flex-1 p-4 h-96 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start my-2">
                 <div className="p-3 rounded-lg max-w-xs bg-gray-200 text-gray-800">
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '75ms'}}></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></span>
                    </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-4 flex">
            <label htmlFor="chatbot-input" className="sr-only">Your message</label>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask something..."
              className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;