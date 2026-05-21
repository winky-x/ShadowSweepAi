const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Text clipping fix
content = content.replace(
  '<h3 className="text-lg md:text-2xl font-medium tracking-wide text-white uppercase">\n                    AWAITING SECURE VIDEO UPLINK\n                  </h3>',
  '<h3 className="text-lg md:text-xl font-medium tracking-wide text-white uppercase text-center flex-wrap px-4">\n                    AWAITING SECURE VIDEO UPLINK\n                  </h3>'
);

// 2. True Glassmorphism (All Panels)
content = content.replace(
  /bg-zinc-900\/30 backdrop-blur-2xl border border-white\/5 shadow-2xl rounded-xl/g,
  'bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl'
);
content = content.replace(
  /bg-zinc-900\/30 backdrop-blur-2xl border shadow-2xl rounded-xl/g,
  'bg-white/[0.03] backdrop-blur-xl border shadow-2xl rounded-2xl'
);
content = content.replace(
  /backdrop-blur-2xl border shadow-2xl rounded-xl p-3 md:p-4/g,
  'backdrop-blur-xl border shadow-2xl rounded-2xl p-4 md:p-6'
);
content = content.replace(
  /bg-zinc-900\/30 border-white\/5/g,
  'bg-white/[0.03] border-white/10'
);

// 3. Fix the "DEPLOY ROBOT" Button
const oldButtonRegex = /<button\s+onClick=\{handleDeploy\}[\s\S]*?<\/button>/;
const newButtonStr = `<button 
                onClick={handleDeploy}
                disabled={deployState === "DEPLOYING" || deployState === "SEARCHING"}
                className={\`w-full min-h-[80px] rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed \${
                  deployState !== "OFFLINE" 
                    ? "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.15)] hover:shadow-[0_0_30px_rgba(225,29,72,0.3)]" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                }\`}
              >
                {deployState === "OFFLINE" ? (
                  <div className="flex items-center gap-3">
                    <Play className="w-6 h-6 text-emerald-400 fill-transparent transition-all duration-300" />
                    <span className="text-emerald-400 font-bold tracking-widest text-lg uppercase">Deploy Robot</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Square className="w-6 h-6 text-rose-500 fill-transparent transition-all duration-300" />
                    <span className="text-rose-500 font-bold tracking-widest text-lg uppercase">Recall Robot</span>
                  </div>
                )}
              </button>`;
content = content.replace(oldButtonRegex, newButtonStr);

// 4. Fix the IP Address Input
content = content.replace(
  'className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors font-mono min-h-[44px]"',
  'className="bg-black/50 border border-white/10 text-emerald-400 font-mono focus:border-cyan-500 outline-none rounded-lg p-3 w-full transition-colors"'
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully applied precise CSS overrides');
