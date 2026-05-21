const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Root Container (Fixing viewport)
content = content.replace(
  '<div className="flex flex-col h-screen overflow-hidden text-zinc-100 font-sans tracking-wide">',
  '<div className="flex flex-col min-h-[100dvh] bg-slate-950 text-slate-200 font-sans tracking-wide lg:h-screen lg:overflow-hidden">'
);
content = content.replace(
  '<main className="relative z-10 flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 p-4 max-w-[1920px] mx-auto w-full overflow-y-auto lg:overflow-hidden lg:min-h-0">',
  '<main className="relative z-10 flex-1 w-full max-w-[1920px] mx-auto p-2 sm:p-4 lg:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-6 overflow-y-auto lg:overflow-hidden lg:min-h-0">'
);

// 2. Camera Viewport
content = content.replace(
  '<section className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-3 min-h-[350px] lg:h-full">',
  '<section className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-3 w-full min-h-[250px] sm:min-h-[300px] lg:h-full">'
);
content = content.replace(
  '<h3 className="text-lg md:text-xl font-medium tracking-wide text-white uppercase text-center flex-wrap px-4">',
  '<h3 className="text-sm sm:text-base md:text-xl font-medium tracking-wide text-white uppercase text-center flex-wrap px-4">'
);
content = content.replace(
  '<h3 className="text-lg md:text-2xl font-medium tracking-wide text-white uppercase">\n                    ESTABLISHING ROBOT CONNECTION...\n                  </h3>',
  '<h3 className="text-sm sm:text-base md:text-2xl font-medium tracking-wide text-white uppercase text-center px-4">\n                    ESTABLISHING CONNECTION...\n                  </h3>'
);


// 3. Control Center (IP & Deploy Button)
content = content.replace(
  '<div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col h-full">',
  '<div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 lg:p-6 flex flex-col h-full">'
);
content = content.replace(
  'className="bg-black/50 border border-white/10 text-emerald-400 font-mono focus:border-cyan-500 outline-none rounded-lg p-3 w-full transition-colors"',
  'className="bg-black/50 border border-white/10 text-emerald-400 font-mono focus:border-cyan-500 outline-none rounded-lg p-2 text-sm w-full transition-colors"'
);
content = content.replace(
  /className=\{`w-full min-h-\[80px\] rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed/g,
  'className={`w-full min-h-[60px] lg:min-h-[80px] rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
);
content = content.replace(
  /text-emerald-400 font-bold tracking-widest text-lg uppercase/g,
  'text-emerald-400 font-bold tracking-widest text-base lg:text-lg uppercase'
);
content = content.replace(
  /text-rose-500 font-bold tracking-widest text-lg uppercase/g,
  'text-rose-500 font-bold tracking-widest text-base lg:text-lg uppercase'
);

// 4. Logs / Threat Registry
content = content.replace(
  '<section className="order-4 lg:order-3 lg:col-span-3 flex flex-col gap-4 min-h-[400px] lg:h-full">',
  '<section className="order-4 lg:order-3 lg:col-span-3 flex flex-col gap-3">'
);
content = content.replace(
  '<div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs text-zinc-200 terminal-scrollbar font-mono">',
  '<div className="flex-1 min-h-[200px] max-h-[300px] lg:max-h-full overflow-y-auto p-3 lg:p-4 flex flex-col gap-3 text-[10px] sm:text-xs text-zinc-200 terminal-scrollbar font-mono">'
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully applied responsive layout fixes');
