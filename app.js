// Futuristic XCLODE OS Dashboard Component
const XclodeOS = () => {
    const [logs, setLogs] = React.useState([
        "SYSTEM INITIALIZATION...",
        "CORE MODULES LOADED SUCCESSFULLY.",
        "READY FOR QUANTUM OPERATIONS."
    ]);

    const runDiagnostic = () => {
        setLogs(prev => [...prev, `DIAGNOSTIC RUNNING: ${new Date().toLocaleTimeString()} - ALL SYSTEMS NOMINAL.`]);
    };

    return (
        <div className="min-h-screen p-6 flex flex-col justify-between">
            {/* Top Bar */}
            <header className="border-b border-[#00ffcc] pb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-widest text-[#00ffcc] drop-shadow-[0_0_5px_#00ffcc]">
                    XCLODE // OS_v1.0
                </h1>
                <div className="text-xs text-right">
                    <p>STATUS: ACTIVE</p>
                    <p>SECURE NODE: RIND_HOUSE_NET</p>
                </div>
            </header>

            {/* Main Grid UI */}
            <main className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 flex-grow">
                {/* Control Panel Card */}
                <div className="border border-[#00ffcc] p-4 bg-[#0a0a14] neon-border flex flex-col justify-between rounded">
                    <div>
                        <h2 className="text-lg font-bold mb-3 border-b border-[#00ffcc]/30 pb-1">// SYSTEM CONTROL</h2>
                        <p className="text-sm text-gray-400 mb-4">Execute autonomous core functions and sub-routines.</p>
                    </div>
                    <button 
                        onClick={runDiagnostic}
                        className="w-full bg-[#00ffcc] text-black font-bold py-2 px-4 rounded hover:bg-black hover:text-[#00ffcc] border border-[#00ffcc] transition duration-300 uppercase text-xs tracking-wider"
                    >
                        Run Core Diagnostic
                    </button>
                </div>

                {/* Console Log Terminal */}
                <div className="border border-[#00ffcc] p-4 bg-black neon-border rounded md:col-span-2 flex flex-col justify-between h-[300px] md:h-auto">
                    <h2 className="text-lg font-bold mb-2 border-b border-[#00ffcc]/30 pb-1">// TERMINAL_LOGS</h2>
                    <div className="overflow-y-auto flex-grow text-xs space-y-1 font-mono text-green-400">
                        {logs.map((log, index) => (
                            <p key={index} className="animate-pulse">{`> ${log}`}</p>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#00ffcc]/30 pt-4 text-center text-xs text-gray-500">
                <p>POWERED BY XYNTRA AI OPERATING ARCHITECTURE // 2026</p>
            </footer>
        </div>
    );
};

// Rendering to the DOM root
const root = Scrooge = tragic = ReactDOM.createRoot(document.getElementById('root'));
root.render(<XclodeOS />);
      
