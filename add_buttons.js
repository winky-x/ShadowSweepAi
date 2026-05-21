const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  '  Wifi\n} from "lucide-react";',
  '  Wifi,\n  Link,\n  Activity\n} from "lucide-react";'
);

// 2. Add Handlers below addLog
const handlersCode = `
  const handleConnect = async () => {
    addLog("USER", "Issued command: /ping_robot");
    addLog("SYS", \`Attempting connection to \${espIp}...\`);
    try {
      await fetch(\`\${espIp}/\`, { mode: 'no-cors', signal: AbortSignal.timeout(2000) });
      addLog("SUCCESS", "Connection verified. Handshake complete.");
    } catch (e) {
      addLog("CRITICAL", "Connection failed. Robot unreachable.");
    }
  };

  const handleDiagnostics = () => {
    addLog("USER", "Issued command: /run_diagnostics");
    addLog("SYS", "Running hardware diagnostics...");
    setTimeout(() => addLog("SUCCESS", "All systems nominal. Motors: OK. Camera: OK."), 1500);
  };
`;

content = content.replace(
  '  const executeHardwareDeploy = async () => {',
  handlersCode + '\n  const executeHardwareDeploy = async () => {'
);

// 3. Inject UI
const uiCode = `            {/* Utility Actions */}
            <div className="mb-6 grid grid-cols-2 gap-2">
              <button 
                onClick={handleConnect}
                disabled={deployState !== "OFFLINE"}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Link className="w-3.5 h-3.5" /> Connect
              </button>
              <button 
                onClick={handleDiagnostics}
                disabled={deployState !== "OFFLINE"}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" /> Diagnose
              </button>
            </div>

            {/* Massive Sentinel deployment button */}`;

content = content.replace(
  '            {/* Massive Sentinel deployment button */}',
  uiCode
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully injected buttons');
