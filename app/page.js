'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Terminal, Shield, Cpu, Layers, Activity, LogOut } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [terminalLogs, setTerminalLogs] = useState(['[SYSTEM] SYSTEM INITIALIZED.', '[SYSTEM] SECURE NODE: RIND_HOUSE_NET']);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;
    if (authMode === 'login') {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    } else {
      ({ error } = await supabase.auth.signUp({ email, password }));
    }
    if (error) {
      setTerminalLogs(prev => [...prev, `[AUTH_ERROR] ${error.message}`]);
    } else {
      setTerminalLogs(prev => [...prev, `[AUTH_SUCCESS] Session verified standard protocol.`]);
    }
    setLoading(false);
  };

  const executeAction = async (actionType) => {
    setTerminalLogs(prev => [...prev, `[COMMAND] Executing ${actionType} operational sequence...`]);
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, prompt: userInput })
      });
      const data = await res.json();
      setTerminalLogs(prev => [...prev, `[BACKEND_RESPONSE] ${data.result}`]);
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[CRITICAL_FAILURE] Backend serverless route unreachable.`]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTerminalLogs(['[SYSTEM] Session terminated safely.']);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-[#00ffcc] bg-[#0a0a14] p-6 rounded font-mono">
          <div className="flex items-center gap-2 mb-6 border-b border-[#00ffcc]/30 pb-3">
            <Shield className="text-[#00ffcc]" size={24} />
            <h1 className="text-xl font-bold tracking-widest text-[#00ffcc]">XYNTRA GATEWAY</h1>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Secure Vector Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black border border-[#00ffcc]/50 p-2 text-sm text-[#00ffcc] focus:outline-none focus:border-[#00ffcc]" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Access Passcode</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black border border-[#00ffcc]/50 p-2 text-sm text-[#00ffcc] focus:outline-none focus:border-[#00ffcc]" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#00ffcc] text-black font-bold py-2 text-xs uppercase tracking-wider hover:bg-black hover:text-[#00ffcc] border border-[#00ffcc] transition duration-200">
              {loading ? 'Processing Matrix...' : authMode === 'login' ? 'Establish Session' : 'Register Core ID'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs text-gray-500 hover:text-[#00ffcc] underline">
              {authMode === 'login' ? 'Request New Operational Identity' : 'Already Verified? Access Portal'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-6">
      <header className="border-b border-[#00ffcc] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-[#00ffcc] flex items-center gap-2">
            <Cpu size={28} /> XYNTRA // AGENCY_OS
          </h1>
          <p className="text-xs text-gray-500 mt-1">OPERATOR ID: {user.email}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00ffcc] mr-2"></span>
            <span className="text-gray-400">DATABASE INTEGRITY: OPTIMAL</span>
          </div>
          <button onClick={handleLogout} className="border border-red-500/50 text-red-400 px-3 py-1 flex items-center gap-1 hover:bg-red-900/20 transition rounded text-xs uppercase">
            <LogOut size={14} /> Kill Session
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-grow">
        <div className="space-y-4">
          <div className="border border-[#00ffcc] bg-[#0a0a14] p-4 rounded">
            <h2 className="text-sm font-bold tracking-wider mb-3 flex items-center gap-1 uppercase text-gray-300">
              <Layers size={16} className="text-[#00ffcc]" /> AI Agent Core Arrays
            </h2>
            <p className="text-xs text-gray-400 mb-4">Direct autonomous routines for parsing, scraping, and automated execution metrics.</p>
            
            <div className="space-y-2">
              <button onClick={() => executeAction('OMNI_EXTRACT')} className="w-full border border-[#00ffcc]/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-[#00ffcc] transition group rounded">
                <span>⚡ OMNI EXTRACTOR ENGAGE</span>
                <span className="text-gray-500 group-hover:text-[#00ffcc]">&gt; RUN</span>
              </button>
              <button onClick={() => executeAction('SEO_AUTOMATION')} className="w-full border border-[#00ffcc]/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-[#00ffcc] transition group rounded">
                <span>🔍 AI SEO SEARCH CRON</span>
                <span className="text-gray-500 group-hover:text-[#00ffcc]">&gt; EXEC</span>
              </button>
            </div>
          </div>

          <div className="border border-[#00ffcc] bg-[#0a0a14] p-4 rounded">
            <label className="block text-xs uppercase text-gray-400 mb-2">Operational Prompt Injection</label>
            <input type="text" value={userInput} onChange={e=>setUserInput(e.target.value)} placeholder="Enter query parameters or target URLs..." className="w-full bg-black border border-[#00ffcc]/50 p-2 text-xs text-[#00ffcc] focus:outline-none focus:border-[#00ffcc] mb-2 rounded" />
          </div>
        </div>

        <div className="lg:col-span-2 border border-[#00ffcc] bg-black p-4 rounded flex flex-col justify-between min-h-[350px]">
          <div className="flex justify-between items-center border-b border-[#00ffcc]/30 pb-2 mb-2">
            <h2 className="text-sm font-bold tracking-wider flex items-center gap-2 text-gray-300">
              <Terminal size={16} className="text-[#00ffcc]" /> MAIN_LOG_STREAM
            </h2>
            <Activity size={14} className="text-[#00ffcc]" />
          </div>
          <div className="flex-grow overflow-y-auto text-xs space-y-1 font-mono text-green-400 max-h-[400px] pr-2">
            {terminalLogs.map((log, idx) => (
              <p key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</p>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#00ffcc]/20 pt-4 flex justify-between items-center text-[10px] text-gray-500">
        <p>XYNTRA ARCHITECTURE SYSTEM // SECURITY ENFORCED PLATFORM</p>
        <p>NODE LEVEL: SYSTEM ADMIN</p>
      </footer>
    </div>
  );
}
