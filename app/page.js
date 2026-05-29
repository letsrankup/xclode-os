'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Terminal, Shield, Cpu, Layers, Activity, LogOut, Download, 
  Crosshair, Link2, FileSearch, Fingerprint, Spider, AlertTriangle, Bot 
} from 'lucide-react';
import { jsPDF } from "jspdf";

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [terminalLogs, setTerminalLogs] = useState(['[SYSTEM] SYSTEM INITIALIZED.', '[SYSTEM] SECURE NODE: RIND_HOUSE_NET']);
  const [userInput, setUserInput] = useState('');
  const [lastScannedUrl, setLastScannedUrl] = useState('');

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
    if (!userInput) {
      setTerminalLogs(prev => [...prev, `[SYSTEM_WARNING] Target URL missing. Injection aborted.`]);
      return;
    }

    setTerminalLogs(prev => [...prev, `[COMMAND] Executing ${actionType} operational sequence on ${userInput}...`]);
    setLastScannedUrl(userInput);
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, prompt: userInput })
      });
      const data = await res.json();
      setTerminalLogs(prev => [...prev, `[BACKEND_RESPONSE] ${data.result}`]);
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[CRITICAL_FAILURE] Backend API unreachable. Check Vercel/Netlify routing.`]);
    }
  };

  const handleExportPDF = () => {
    if (!lastScannedUrl) {
      alert("Please run a scan first before exporting the report.");
      return;
    }

    const doc = new jsPDF();
    
    // VIP Hacker Style Header
    doc.setFillColor(5, 5, 10);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(24);
    doc.setTextColor(0, 255, 204);
    doc.text("XYNTRA - DEEP INTELLIGENCE AUDIT", 15, 25);
    
    // Target Data Section
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`TARGET ENTITY: ${lastScannedUrl}`, 15, 38);
    
    doc.setFontSize(16);
    doc.setTextColor(220, 50, 50);
    doc.text("CLASSIFIED EXTRACTED DATA:", 15, 60);
    
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    
    // Simulated deep data payload
    const issues = [
      "» TECH STACK: React, Next.js, Tailwind CSS detected.",
      "» HIDDEN CONTACTS: admin@target.com, +1-555-0198 extracted.",
      "» KEYWORD GAP: Competitor holds 45% more volume in 'Services' silo.",
      "» AI CONTENT ALERT: 78% probability of LLM generated text on homepage.",
      "» BACKLINK TOXICITY: 12 spam domains pointing to target root.",
      "» VULNERABILITY: Missing security headers (X-Frame-Options)."
    ];
    
    let yPos = 75;
    issues.forEach((issue) => {
      doc.text(issue, 15, yPos);
      yPos += 12;
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Authorized by Xyntra Agency_OS // King of RIND", 15, 280);

    doc.save(`Xyntra-Deep-Scan-${lastScannedUrl.replace('https://', '').replace('/', '')}.pdf`);
    setTerminalLogs(prev => [...prev, `[SYSTEM] Classified PDF exported successfully.`]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTerminalLogs(['[SYSTEM] Session terminated safely.']);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
        {/* Login Screen remains the same as your previous code */}
        <div className="w-full max-w-md border border-[#00ffcc]/50 bg-[#0a0a14] p-8 rounded-lg shadow-[0_0_15px_rgba(0,255,204,0.2)] font-mono">
          <div className="flex flex-col items-center gap-3 mb-8 border-b border-[#00ffcc]/20 pb-6">
            <Shield className="text-[#00ffcc]" size={40} />
            <h1 className="text-2xl font-bold tracking-[0.2em] text-[#00ffcc]">XYNTRA SECURE</h1>
          </div>
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-2">Secure Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black/50 border border-[#00ffcc]/30 p-3 text-sm text-[#00ffcc] focus:outline-none focus:border-[#00ffcc] rounded" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-2">Passcode</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/50 border border-[#00ffcc]/30 p-3 text-sm text-[#00ffcc] focus:outline-none focus:border-[#00ffcc] rounded" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#00ffcc]/10 text-[#00ffcc] font-bold py-3 text-xs uppercase tracking-widest hover:bg-[#00ffcc] hover:text-black border border-[#00ffcc] transition-all rounded mt-4">
              {loading ? 'Decrypting...' : authMode === 'login' ? 'Initiate Uplink' : 'Register Core ID'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs text-gray-500 hover:text-[#00ffcc]">
              {authMode === 'login' ? '[ Request New Operator Node ]' : '[ Existing Operator Uplink ]'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 flex flex-col p-4 md:p-6 font-mono">
      <header className="border-b border-[#00ffcc]/30 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#00ffcc] flex items-center gap-3">
            <Cpu size={28} /> XYNTRA // AGENCY_OS
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Operator Session: {user.email}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse mr-2"></span>
            <span className="text-gray-400">NODE STATUS: ACTIVE</span>
          </div>
          <button onClick={handleLogout} className="border border-red-500/30 text-red-400 px-4 py-2 hover:bg-red-900/20 hover:border-red-500 transition-all rounded text-[10px] uppercase tracking-wider flex items-center gap-2">
            <LogOut size={14} /> Terminate
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 flex-grow">
        {/* LEFT PANEL: INJECTION & ADVANCED TOOLS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-[#00ffcc]/30 bg-[#0a0a14] p-5 rounded-lg shadow-[0_0_10px_rgba(0,255,204,0.05)]">
            <label className="block text-[10px] uppercase tracking-widest text-[#00ffcc] mb-3">Target Injection Payload</label>
            <input type="text" value={userInput} onChange={e=>setUserInput(e.target.value)} placeholder="e.g., https://client-domain.com" className="w-full bg-black border border-[#00ffcc]/50 p-3 text-sm text-[#00ffcc] focus:outline-none focus:border-[#00ffcc] focus:ring-1 focus:ring-[#00ffcc] transition-all rounded mb-2 placeholder-gray-700" />
          </div>

          <div className="border border-[#00ffcc]/30 bg-[#0a0a14] p-5 rounded-lg max-h-[500px] overflow-y-auto custom-scrollbar">
            <h2 className="text-xs font-bold tracking-[0.1em] mb-4 flex items-center gap-2 text-[#00ffcc]">
              <Layers size={16} /> CORE DIRECTIVES
            </h2>
            
            {/* CATEGORY 1: RECONNAISSANCE */}
            <div className="mb-5">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 block border-b border-gray-800 pb-1">[ DOMAIN RECONNAISSANCE ]</span>
              <div className="space-y-2 mt-2">
                <button onClick={() => executeAction('TECH_FINGERPRINT')} className="w-full border border-teal-900/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-teal-500 hover:bg-teal-500/5 transition-all group rounded">
                  <span className="flex items-center gap-2"><Fingerprint size={14} className="text-gray-500 group-hover:text-teal-400"/> TECH FINGERPRINT</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-teal-400">SCAN &gt;</span>
                </button>

                <button onClick={() => executeAction('CONTACT_SPIDER')} className="w-full border border-orange-900/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-orange-500 hover:bg-orange-500/5 transition-all group rounded">
                  <span className="flex items-center gap-2"><Spider size={14} className="text-gray-500 group-hover:text-orange-400"/> CONTACT SPIDER</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-orange-400">CRAWL &gt;</span>
                </button>

                <button onClick={() => executeAction('BACKLINK_RECON')} className="w-full border border-blue-900/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-blue-500 hover:bg-blue-500/5 transition-all group rounded">
                  <span className="flex items-center gap-2"><Link2 size={14} className="text-gray-500 group-hover:text-blue-400"/> BACKLINK RECON</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-blue-400">TRACE &gt;</span>
                </button>
              </div>
            </div>

            {/* CATEGORY 2: AI & SEO METRICS */}
            <div>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 block border-b border-gray-800 pb-1">[ AI & SEO METRICS ]</span>
              <div className="space-y-2 mt-2">
                <button onClick={() => executeAction('AI_CONTENT_DETECT')} className="w-full border border-indigo-900/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group rounded">
                  <span className="flex items-center gap-2"><Bot size={14} className="text-gray-500 group-hover:text-indigo-400"/> AI CONTENT DETECTOR</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-indigo-400">ANALYZE &gt;</span>
                </button>

                <button onClick={() => executeAction('COMPETITOR_MATRIX')} className="w-full border border-purple-900/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-purple-500 hover:bg-purple-500/5 transition-all group rounded">
                  <span className="flex items-center gap-2"><Crosshair size={14} className="text-gray-500 group-hover:text-purple-400"/> COMPETITOR MATRIX</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-purple-400">TARGET &gt;</span>
                </button>

                <button onClick={() => executeAction('VULNERABILITY_SCAN')} className="w-full border border-red-900/40 bg-black text-left p-3 text-xs flex items-center justify-between hover:border-red-500 hover:bg-red-500/5 transition-all group rounded">
                  <span className="flex items-center gap-2"><AlertTriangle size={14} className="text-gray-500 group-hover:text-red-400"/> VULNERABILITY SCAN</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-red-400">PROBE &gt;</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: TERMINAL LOGS */}
        <div className="lg:col-span-8 border border-[#00ffcc]/30 bg-black p-5 rounded-lg flex flex-col justify-between min-h-[500px] shadow-inner relative">
          <div className="flex justify-between items-center border-b border-[#00ffcc]/20 pb-3 mb-4">
            <h2 className="text-xs font-bold tracking-widest flex items-center gap-2 text-gray-400">
              <Terminal size={16} className="text-[#00ffcc]" /> MAIN_LOG_STREAM
            </h2>
            
            {/* VIP EXPORT BUTTON */}
            <button 
              onClick={handleExportPDF}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded transition-all duration-300 ${lastScannedUrl ? 'bg-[#00ffcc] text-black hover:bg-white hover:shadow-[0_0_10px_#00ffcc]' : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'}`}
            >
              <Download size={14} /> {lastScannedUrl ? 'Export VIP Intelligence' : 'Awaiting Data...'}
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto text-xs space-y-2 font-mono text-[#00ffcc] pr-2 custom-scrollbar">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-gray-600 opacity-50">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                <span className="leading-relaxed whitespace-pre-wrap flex-1">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#00ffcc]/20 pt-4 flex justify-between items-center text-[9px] text-gray-600 uppercase tracking-widest">
        <p>Xyntra Architecture // Node: Khuzdar_Alpha</p>
        <p>Encrypted by King of RIND</p>
      </footer>
    </div>
  );
        }
                               
