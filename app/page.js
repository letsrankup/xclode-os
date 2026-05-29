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

  // 1. GUEST SCREEN: If user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-[#00ffcc] bg-[#0a0a14] p-6 rounded neon-border font-mono">
          <div className="flex items-center gap-2 mb-6 border-b border-[#00ffcc]/30 pb-3">
            <Shield className="text-[#00ffcc] animate-pulse" size={24} />
            <h1 className="text-xl font-bold tracking-widest neon-text">XYNTRA GATEWAY</h1>
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
            <button type="submit" disabled={loading} className="w-full bg-[#00ffcc] text-black font-bold py-2 text-xs uppercase tracking
             
