"use client";
import { useState } from 'react';

export default function XyntraOS() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResults(data); // Ye line data ko UI par show karegi
    } catch (err) {
      alert("Error connecting to backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-[#00ff9d] p-4 font-mono">
      <h1 className="text-xl mb-4 border-b border-[#00ff9d]/30 pb-2">XYNTRA // SEO ENGINE</h1>
      
      {/* Input Section */}
      <div className="flex flex-col gap-3 mb-6">
        <input 
          className="bg-[#111] border border-[#00ff9d] p-3 text-sm focus:outline-none"
          placeholder="https://target-website.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button 
          onClick={runAudit} 
          className="bg-[#00ff9d] text-black font-bold p-3 uppercase text-sm"
        >
          {loading ? "EXECUTING..." : "RUN AUDIT"}
        </button>
      </div>

      {/* Output Display - Ye section data dikhayega */}
      {results && (
        <div className="border border-[#00ff9d]/30 p-4 bg-[#0a0a0a] animate-in fade-in">
          <h2 className="text-[#00d4ff] mb-4 text-xs tracking-widest uppercase">// Audit Report</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border-b border-[#00ff9d]/10 pb-2">Title: <span className="text-white">{results.title}</span></div>
            <div className="border-b border-[#00ff9d]/10 pb-2">H1 Tags: <span className="text-white">{results.h1}</span></div>
            <div className="border-b border-[#00ff9d]/10 pb-2">H2 Tags: <span className="text-white">{results.h2}</span></div>
            <div className="border-b border-[#00ff9d]/10 pb-2">Links: <span className="text-white">{results.links}</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#00ff9d]/10">
            Status: {results.meta ? "✅ Meta Tag Found" : "❌ Meta Tag Missing"}
          </div>
        </div>
      )}
    </div>
  );
        }
        
