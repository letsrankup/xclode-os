"use client";
import { useState } from 'react';

export default function XyntraOS() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    const res = await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  return (
    <div className="bg-[#050505] text-[#00ff9d] min-h-screen p-6 font-mono">
      <h1 className="text-2xl mb-6 border-b border-[#00ff9d]/20 pb-4">XYNTRA // SEO ENGINE</h1>
      
      <div className="flex gap-4 mb-8">
        <input className="flex-1 bg-black border border-[#00ff9d] p-3" placeholder="Target URL..." onChange={(e) => setUrl(e.target.value)} />
        <button onClick={runAudit} className="bg-[#00ff9d] text-black px-6 font-bold">RUN AUDIT</button>
      </div>

      {report && (
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-[#00ff9d]/30 p-4">
            <h2 className="text-lg mb-4 text-[#00d4ff]">STRUCTURE ANALYSIS</h2>
            <p>Title: {report.title}</p>
            <p>H1 Count: {report.h1}</p>
            <p>H2 Count: {report.h2}</p>
          </div>
          <div className="border border-[#00ff9d]/30 p-4">
            <h2 className="text-lg mb-4 text-[#00d4ff]">CHECKLIST</h2>
            <ul className={report.meta ? "text-green-500" : "text-red-500"}>
              {report.meta ? "✅ Meta Description Found" : "❌ Meta Missing"}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
