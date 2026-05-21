const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Center Viewport Section height and gap
content = content.replace(
  /<section className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-4 min-h-\[500px\] lg:h-full">/,
  '<section className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-3 min-h-[350px] lg:h-full">'
);

// 2. Hide Top Bar on Mobile & reduce padding
content = content.replace(
  /<div className="relative z-10 flex items-center justify-between px-4 py-3.5 border-b border-white\/5 bg-zinc-900\/40 text-\[10px\] text-zinc-400 uppercase tracking-widest font-semibold">/,
  '<div className="relative z-10 hidden md:flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/40 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">'
);

// 3. Offline UI: Make AWAITING SECURE VIDEO UPLINK text & circle smaller
content = content.replace(
  /<div className="absolute inset-0 bg-zinc-950\/40 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-8">/,
  '<div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4">'
);
content = content.replace(
  /<div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-white\/5 bg-white\/5 mb-6 shadow-xl">/,
  '<div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-white/5 bg-white/5 mb-3 shadow-xl">'
);
content = content.replace(
  /<Camera className="w-8 h-8 text-zinc-300 animate-pulse" \/>/,
  '<Camera className="w-5 h-5 text-zinc-300 animate-pulse" />'
);
content = content.replace(
  /<h3 className="text-2xl md:text-3xl font-medium tracking-wide text-white uppercase">/g,
  '<h3 className="text-lg md:text-2xl font-medium tracking-wide text-white uppercase">'
);

// 4. Viewfinder Controls (STD / NVG / THERM) - make extremely compact
content = content.replace(
  /<div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 border-t border-white\/5 bg-zinc-900\/40 text-xs">/,
  '<div className="relative z-10 flex flex-wrap items-center justify-between gap-1 px-2 py-2 border-t border-white/5 bg-zinc-900/40 text-[10px]">'
);
// replace min-h-[40px], px-3 py-1.5, rounded-lg with more compact sizes
content = content.replace(/px-3 py-1.5 rounded-lg border transition-colors font-bold uppercase tracking-wider cursor-pointer min-h-\[40px\]/g, 'px-2 py-1 rounded border transition-colors font-bold uppercase tracking-wider cursor-pointer');

// 5. Grid button
content = content.replace(/className={`flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer min-h-\[40px\]/g, 'className={`flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer');
content = content.replace(/<Grid className="w-4 h-4" \/>/g, '<Grid className="w-3 h-3" />');

// 6. Threat Banner - reduce paddings and text sizes
content = content.replace(
  /<div className={`backdrop-blur-2xl border shadow-2xl rounded-xl p-4 md:p-6 flex-shrink-0 text-center flex flex-col items-center justify-center transition-all duration-500 \${/g,
  '<div className={`backdrop-blur-2xl border shadow-2xl rounded-xl p-3 md:p-4 flex-shrink-0 text-center flex flex-col items-center justify-center transition-all duration-500 ${'
);
content = content.replace(
  /<span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Threat Evaluation Registry<\/span>/,
  '<span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Threat Evaluation Registry</span>'
);
content = content.replace(
  /<h3 className={`text-2xl md:text-3xl lg:text-4xl font-medium uppercase tracking-wide mt-2 transition-all duration-300 \${/g,
  '<h3 className={`text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-wide mt-1 transition-all duration-300 ${'
);

// 7. Simplify "ROBOT OFFLINE // READY TO DEPLOY" to "ROBOT OFFLINE // READY"
content = content.replace(
  /\{deployState === "OFFLINE" && "ROBOT OFFLINE \/\/ READY TO DEPLOY"\}/,
  '{deployState === "OFFLINE" && "ROBOT OFFLINE // READY"}'
);

// Write changes
fs.writeFileSync('src/app/page.tsx', content);
console.log('Successfully applied mobile UI fixes');
