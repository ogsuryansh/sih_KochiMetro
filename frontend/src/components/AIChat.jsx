import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hello! I\'m your AI assistant for Kochi Metro. How can I help you with fleet management today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Get AI response with real data
      const aiResponse = await getAIResponse(currentInput);
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: '❌ Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    
    try {
      // Fetch real train data
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://sihkochimetro.vercel.app'}/api/dashboard/trains`);
      const trains = response.data.success ? response.data.data : [];
      
      if (input.includes('train') && (input.includes('running') || input.includes('service'))) {
        const serviceTrains = trains.filter(train => train.status === 'Service');
        const standbyTrains = trains.filter(train => train.status === 'Standby');
        const maintenanceTrains = trains.filter(train => train.status === 'Maintenance');
        
        let response = `🚆 <strong>Current Train Status:</strong>\n\n`;
        response += `✅ <strong>In Service:</strong> ${serviceTrains.length} trains\n`;
        response += `⏸️ <strong>Standby:</strong> ${standbyTrains.length} trains\n`;
        response += `🔧 <strong>Maintenance:</strong> ${maintenanceTrains.length} trains\n\n`;
        
        if (serviceTrains.length > 0) {
          response += `<strong>Trains currently running:</strong>\n`;
          serviceTrains.slice(0, 5).forEach(train => {
            response += `• ${train.trainId} (${train.fitness} fitness)\n`;
          });
          if (serviceTrains.length > 5) {
            response += `• ... and ${serviceTrains.length - 5} more\n`;
          }
        }
        
        return response;
      } else if (input.includes('train') && input.includes('status')) {
        const serviceTrains = trains.filter(train => train.status === 'Service');
        const standbyTrains = trains.filter(train => train.status === 'Standby');
        const maintenanceTrains = trains.filter(train => train.status === 'Maintenance');
        
        return `📊 <strong>Fleet Status Summary:</strong>\n\n✅ In Service: ${serviceTrains.length} trains\n⏸️ Standby: ${standbyTrains.length} trains\n🔧 Maintenance: ${maintenanceTrains.length} trains\n\nTotal Fleet: ${trains.length} trains\n\nWould you like details about any specific train?`;
      } else if (input.includes('maintenance')) {
        const maintenanceTrains = trains.filter(train => train.status === 'Maintenance');
        const overdueTrains = trains.filter(train => {
          const nextMaintenance = new Date(train.nextMaintenance);
          return nextMaintenance < new Date();
        });
        
        let response = `🔧 <strong>Maintenance Status:</strong>\n\n`;
        response += `Currently under maintenance: ${maintenanceTrains.length} trains\n`;
        response += `Overdue maintenance: ${overdueTrains.length} trains\n\n`;
        
        if (maintenanceTrains.length > 0) {
          response += `<strong>Trains in maintenance:</strong>\n`;
          maintenanceTrains.forEach(train => {
            response += `• ${train.trainId} - Last: ${train.lastMaintenance}\n`;
          });
        }
        
        return response;
      } else if (input.includes('train') && input.includes('id')) {
        // Extract train ID from input
        const trainIdMatch = input.match(/train\s*(\w+)/i);
        if (trainIdMatch) {
          const searchId = trainIdMatch[1].toUpperCase();
          const train = trains.find(t => t.trainId.toUpperCase().includes(searchId));
          
          if (train) {
            return `🚆 <strong>Train ${train.trainId} Details:</strong>\n\n` +
                   `Status: ${train.status}\n` +
                   `Mileage: ${train.mileage.toLocaleString()} km\n` +
                   `Fitness: ${train.fitness}\n` +
                   `Job Card: ${train.jobCardStatus}\n` +
                   `Last Maintenance: ${train.lastMaintenance}\n` +
                   `Next Maintenance: ${train.nextMaintenance}`;
          } else {
            return `❌ Train ${searchId} not found. Please check the train ID and try again.`;
          }
        }
        return `Please specify a train ID. For example: "Tell me about train KM001"`;
      } else if (input.includes('optimization') || input.includes('ai plan')) {
        return '🤖 <strong>AI Optimization:</strong>\n\nThe AI optimization feature can help improve fleet efficiency by 15-20%. It analyzes:\n• Train utilization patterns\n• Maintenance schedules\n• Route optimization\n• Energy consumption\n\nWould you like me to run an optimization analysis?';
      } else if (input.includes('help') || input.includes('what can you do')) {
        return '🤖 <strong>I can help you with:</strong>\n\n• 🚆 Train status and fleet information\n• 🔧 Maintenance scheduling and alerts\n• 📊 Performance analytics\n• 🤖 AI optimization recommendations\n• 🔍 Specific train details\n• 📈 Fleet efficiency insights\n\n<strong>Try asking:</strong>\n• "Which trains are running?"\n• "Show me train KM001"\n• "What\'s the maintenance status?"\n• "Run AI optimization"';
      } else if (input.includes('hello') || input.includes('hi')) {
        return '👋 Hello! I\'m your AI assistant for Kochi Metro fleet management. I can help you with train status, maintenance, and optimization. What would you like to know?';
      } else {
        return `🤔 I understand you're asking about "${userInput}". I can help you with:\n\n• Train status and details\n• Maintenance information\n• Fleet analytics\n• AI optimization\n\nCould you be more specific? For example: "Which trains are running?" or "Show me train details"`;
      }
    } catch (error) {
      console.error('Error fetching train data:', error);
      return '❌ Sorry, I\'m having trouble accessing the train data right now. Please try again in a moment.';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-500/10 to-teal-600/10 border border-teal-500/20 rounded-lg hover:from-teal-500/20 hover:to-teal-600/20 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            <p className="text-sm text-teal-400">Ask me anything about your fleet</p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-teal-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 flex flex-col">
          {/* Chat Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: message.text }}></p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your fleet..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
