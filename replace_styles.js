const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. General Replacements
content = content.replace(/bg-slate-900\/30/g, 'bg-zinc-900/30');
content = content.replace(/bg-slate-900\/40/g, 'bg-zinc-900/40');
content = content.replace(/bg-slate-900\/20/g, 'bg-black/20');
content = content.replace(/bg-slate-950/g, 'bg-zinc-950');
content = content.replace(/border-white\/10/g, 'border-white/5');
content = content.replace(/rounded-2xl/g, 'rounded-xl');
content = content.replace(/text-slate-/g, 'text-zinc-');
content = content.replace(/bg-slate-900\/50/g, 'bg-zinc-900/50');
content = content.replace(/font-extrabold/g, 'font-medium');
content = content.replace(/font-black/g, 'font-medium');

// 2. The Big Button Replacement
const oldButtonRegex = /<button[\s\S]*?onClick={handleDeploy}[\s\S]*?<\/button>/;
const newButton = `<button 
                onClick={handleDeploy}
                className={\`w-full py-16 rounded-xl font-medium tracking-wider flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer border backdrop-blur-2xl group \${
                  deployState !== "OFFLINE" 
                    ? "bg-zinc-900/50 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500" 
                    : "bg-zinc-900/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
                }\`}
              >
                {deployState === "OFFLINE" ? (
                  <>
                    <Play className="w-8 h-8 text-emerald-400 fill-transparent group-hover:fill-emerald-400/20 transition-all duration-300" />
                    <span className="text-xl font-medium uppercase tracking-widest">Deploy Robot</span>
                    <span className="text-[10px] text-zinc-500 tracking-wider">Tap to mobilize under-vehicle scanner</span>
                  </>
                ) : (
                  <>
                    <Square className="w-8 h-8 text-rose-500 fill-transparent group-hover:fill-rose-500/20 transition-all duration-300" />
                    <span className="text-xl font-medium uppercase tracking-widest">Recall Robot</span>
                    <span className="text-[10px] text-zinc-500 tracking-wider">Tap to disengage and return to dock</span>
                  </>
                )}
              </button>`;
content = content.replace(oldButtonRegex, newButton);

// 3. Status Threat Banners Glow & Style updates
content = content.replace(/bg-red-950\/40 border-red-500\/40 shadow-red-950\/20/g, 'bg-rose-950/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]');
content = content.replace(/bg-emerald-950\/30 border-emerald-500\/40 shadow-emerald-950\/10/g, 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]');

content = content.replace(/text-red-100/g, 'text-rose-500');
content = content.replace(/text-emerald-100/g, 'text-emerald-400');
content = content.replace(/text-red-300/g, 'text-rose-400');
content = content.replace(/text-red-400/g, 'text-rose-500');
content = content.replace(/text-red-500/g, 'text-rose-500');
content = content.replace(/bg-red-500\/20/g, 'bg-rose-500/10');
content = content.replace(/border-red-500\/40/g, 'border-rose-500/30');
content = content.replace(/border-red-500\/30/g, 'border-rose-500/30');

// Safe glowing shadow for SAFE text and ACTIVE nodes
content = content.replace(/>\s*NODE_UPLINK: ACTIVE\s*<\/span>/, '>NODE_UPLINK: ACTIVE</span>');
content = content.replace(/>\s*VEHICLE CLEAR - NO THREATS\s*<\/h3>/, ' style={{ textShadow: "0 0 15px rgba(52,211,153,0.3)" }}>VEHICLE CLEAR - NO THREATS</h3>');
content = content.replace(/>\s*WARNING: EXPLOSIVE DEVICE DETECTED\s*<\/h3>/, ' style={{ textShadow: "0 0 15px rgba(244,63,94,0.3)" }}>WARNING: EXPLOSIVE DEVICE DETECTED</h3>');

fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully updated page.tsx');
