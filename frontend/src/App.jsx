import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Upload from './components/Upload';
import Chat from './components/Chat';
import MediaPlayer from './components/MediaPlayer';
import DocumentList from './components/DocumentList';
import Profile from './components/Profile';
import { LogOut, BrainCircuit, User as UserIcon, Lock, ArrowRight, Menu, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [seekTime, setSeekTime] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoginState, setIsLoginState] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('chat');

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  // Auto-refresh documents if any are still processing
  useEffect(() => {
    let interval;
    const hasProcessingDocs = documents.some(doc => !doc.summary);
    if (hasProcessingDocs && token) {
      interval = setInterval(() => {
        fetchDocuments();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [documents, token]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/documents/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const deleteDocument = async (id) => {
    try {
      await axios.delete(`${API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      setToken(res.data.access_token);
      localStorage.setItem("token", res.data.access_token);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await axios.post(`${API_URL}/auth/register`, { username, password });
      setIsLoginState(true);
      setErrorMsg("Registration successful! Please login.");
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Registration failed. Username might exist.");
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setDocuments([]);
    setSelectedMedia(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden relative font-sans text-gray-100">
        {/* Background dynamic blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-3 rounded-2xl shadow-lg shadow-purple-500/30">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Nexus AI
              </h2>
              <p className="text-center text-gray-400 text-sm mb-8">
                Intelligent Document & Media Analysis
              </p>

              <form onSubmit={isLoginState ? login : register} className="space-y-5">
                <div>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      className="w-full bg-black/20 border border-white/10 focus:border-purple-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" 
                      type="text" 
                      placeholder="Username" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      className="w-full bg-black/20 border border-white/10 focus:border-purple-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className={`text-sm text-center ${errorMsg.includes('successful') ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {isLoginState ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => { setIsLoginState(!isLoginState); setErrorMsg(""); }}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {isLoginState ? "Don't have an account? Register" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 font-sans overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-white/10 bg-[#0f0f0f] md:bg-white/5 backdrop-blur-xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-xl shadow-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Nexus AI</h1>
          </div>
          <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Upload token={token} onUploadSuccess={fetchDocuments} />
          
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pl-2">Navigation</h3>
            <button 
              onClick={() => setCurrentView('chat')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${currentView === 'chat' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <BrainCircuit className="w-5 h-5" />
              <span className="font-medium">AI Chat & Media</span>
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className={`flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl transition-all ${currentView === 'profile' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">My Profile</span>
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pl-2">Your Knowledge Base</h3>
            <DocumentList documents={documents} onSelectMedia={(media) => { setSelectedMedia(media); setCurrentView('chat'); }} selectedMediaId={selectedMedia?.id} onDelete={deleteDocument} />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <button 
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors w-full px-4 py-2 rounded-lg hover:bg-white/5" 
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="ml-3 font-semibold text-gray-200">Nexus AI Chat</div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {currentView === 'profile' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Profile token={token} />
            </div>
          ) : (
            <>
              {selectedMedia && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "40%", opacity: 1 }}
                  className="border-b border-white/10 bg-black/50 backdrop-blur-md relative z-10 shrink-0"
                >
                  <MediaPlayer src={`${API_URL}/media/${selectedMedia.id}`} seekTime={seekTime} type={selectedMedia.file_type} title={selectedMedia.filename} />
                </motion.div>
              )}
              
              <div className="flex-1 relative bg-transparent min-h-0">
                <Chat token={token} onTimestampClick={(time, docId) => {
                  setSeekTime(time);
                  const doc = documents.find(d => d.id === docId);
                  if (doc) setSelectedMedia(doc);
                  setIsSidebarOpen(false); // Auto close sidebar on mobile when navigating from chat source
                }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
