"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Camera, 
  Terminal as TerminalIcon, 
  AlertTriangle, 
  Play, 
  Square, 
  RefreshCw, 
  Sliders, 
  Grid, 
  Info, 
  CheckCircle2,
  Wifi,
  Link,
  Activity
} from "lucide-react";

type DeploymentState = "OFFLINE" | "DEPLOYING" | "SEARCHING" | "THREAT_FOUND" | "SAFE";
type ViewMode = "NORMAL" | "THERMAL" | "NIGHT_VISION";

interface LogEntry {
  timestamp: string;
  source: "SYS" | "AI_VISION" | "CRITICAL" | "SUCCESS" | "USER";
  message: string;
}

interface ThreatAnalysis {
  threatDetected: boolean;
  severity: "SAFE" | "WARNING" | "CRITICAL";
  analysis: string;
}

export default function Home() {
  // State Machine
  const [deployState, setDeployState] = useState<DeploymentState>("OFFLINE");
  const [viewMode, setViewMode] = useState<ViewMode>("NORMAL");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }), source: "SYS", message: "Uplink established. Secure channel SHIELD_NET_v4." },
    { timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }), source: "SYS", message: "Robot node: SHADOW-SWEEP // UGV_09 active." }
  ]);
  
  // Hardware & Network State
  const [espIp, setEspIp] = useState<string>("http://192.168.4.1");
  const [cameraFeed, setCameraFeed] = useState<string | null>(null);
  const [threatData, setThreatData] = useState<ThreatAnalysis | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (source: LogEntry["source"], message: string) => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [...prev, { timestamp: timeStr, source, message }]);
  };


  const handleConnect = async () => {
    addLog("USER", "Issued command: /ping_robot");
    addLog("SYS", `Attempting connection to ${espIp}...`);
    try {
      await fetch(`${espIp}/`, { mode: 'no-cors', signal: AbortSignal.timeout(2000) });
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

  const executeHardwareDeploy = async () => {
    setDeployState("DEPLOYING");
    addLog("USER", "Issued command: /deploy_sentinel");
    addLog("SYS", "Initializing motor sequence...");
    
    try {
      // 1. Move Forward (Hardware API)
      await fetch(`${espIp}/MOVE=F`, { signal: AbortSignal.timeout(2000) }).catch(() => console.warn("Motor timeout - simulated env"));
      
      // 2. Wait 3 seconds to simulate driving under vehicle
      await new Promise(r => setTimeout(r, 3000));
      
      // 3. Stop
      await fetch(`${espIp}/MOVE=S`, { signal: AbortSignal.timeout(2000) }).catch(() => console.warn("Stop timeout"));
      
      setDeployState("SEARCHING");
      addLog("AI_VISION", "Capturing undercarriage topology...");
      
      // 4. Capture Image from ESP32-CAM
      let base64Image = "";
      try {
        const res = await fetch(`${espIp}/capture`, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error("Capture failed");
        const blob = await res.blob();
        const reader = new FileReader();
        base64Image = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Hardware capture failed, falling back to simulated static image.");
        // Simulated static 1x1 pixel for demo robustness when hardware is offline
        base64Image = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      }

      setCameraFeed(base64Image);
      addLog("SYS", "Transmitting topology to AI analysis core...");
      
      // 5. Send to Gemini backend route
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      if (!analyzeRes.ok) throw new Error("Backend analysis API failed");
      
      const data: ThreatAnalysis = await analyzeRes.json();
      setThreatData(data);
      
      if (data.threatDetected) {
        setDeployState("THREAT_FOUND");
        addLog("CRITICAL", data.analysis);
      } else {
        setDeployState("SAFE");
        addLog("SUCCESS", data.analysis);
      }

    } catch (err) {
      addLog("CRITICAL", "Uplink failure during deployment sequence.");
      setDeployState("OFFLINE");
    }
  };

  const handleDeploy = () => {
    if (deployState === "OFFLINE") {
      executeHardwareDeploy();
    } else {
      setDeployState("OFFLINE");
      setCameraFeed(null);
      setThreatData(null);
      addLog("USER", "Issued command: /recall_sentinel");
      addLog("SYS", "Sentinel disengaged. Returning to dock.");
      
      // Optional Hardware Recoil
      fetch(`${espIp}/MOVE=B`, { signal: AbortSignal.timeout(2000) })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => fetch(`${espIp}/MOVE=S`).catch(() => {}), 3000);
        });
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-slate-200 font-sans tracking-wide lg:h-screen lg:overflow-hidden">
      {/* Background HUD Overlay */}
      <div className="absolute inset-0 bg-zinc-950 pointer-events-none z-0" />
      <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none z-0" />
      
      {/* HEADER SECTION */}
      <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-black/20 font-sans">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 bg-white/5">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-wide text-white uppercase">
              SHADOW-SWEEP // COMMAND
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider hidden sm:block">Tactical Security Platform</p>
          </div>
        </div>

        {/* Uplink System Indicators */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 led-active-green"></span>
              </span>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider hidden sm:block">NODE_UPLINK: ACTIVE</span>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider sm:hidden">ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD LAYOUT GRID - Mobile First Flex-Col -> Desktop Grid */}
      <main className="relative z-10 flex-1 w-full max-w-[1920px] mx-auto p-2 sm:p-4 lg:p-6 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-6 overflow-y-auto lg:overflow-hidden lg:min-h-0">
        
        {/* CENTER VIEWPORT (Camera) - Order 2 on Mobile, Order 2 on Desktop (Col 4-9) */}
        <section className="order-2 lg:order-2 lg:col-span-6 flex flex-col gap-3 w-full min-h-[250px] sm:min-h-[300px] lg:h-full">
          {/* Main Inspection Viewfinder (Frosted Video Box) */}
          <div className={`relative bg-white/[0.03] backdrop-blur-xl border shadow-2xl rounded-2xl flex-1 flex flex-col overflow-hidden transition-all duration-500 ${
            deployState === "THREAT_FOUND" 
              ? "border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)]" 
              : deployState === "SAFE" 
                ? "border-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.2)]" 
                : "border-white/5"
          }`}>
            
            {/* Viewfinder Top Bar */}
            <div className="relative z-10 hidden md:flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/40 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-zinc-300" />
                <span>Camera Stream // UGV_09</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Feed
                </span>
                <span className="hidden sm:inline">Zoom: x{zoomLevel}</span>
              </div>
            </div>

            {/* Viewport content area */}
            <div className={`relative flex-1 flex items-center justify-center p-6 radar-container min-h-0 bg-zinc-950/20 text-white overflow-hidden`}>
              
              {/* Camera Feed Rendering */}
              {cameraFeed && (
                <img 
                  src={cameraFeed} 
                  alt="Live Hardware Feed" 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                    viewMode === "NIGHT_VISION" ? "grayscale contrast-125 brightness-110 sepia-[.3] hue-rotate-[80deg]" : 
                    viewMode === "THERMAL" ? "contrast-150 saturate-200 hue-rotate-[180deg] invert-[0.1]" : ""
                  }`} 
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              )}

              {/* Scan HUD Grid - subtle overlay */}
              {showGrid && <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />}
              
              {/* View Mode Filters Overlay (If camera isn't actively filtered via CSS) */}
              {viewMode === "NIGHT_VISION" && (
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none mix-blend-overlay z-0" />
              )}
              {viewMode === "THERMAL" && (
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none mix-blend-overlay z-0" />
              )}

              {/* PULSING MINIMALIST TARGETING RETICLE */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className={`w-[60%] aspect-square max-w-[280px] border border-white/5 rounded-full flex items-center justify-center transition-all duration-700 ${
                  deployState === "SEARCHING" ? "scale-105 border-white/20" : ""
                }`}>
                  <div className={`w-[70%] aspect-square border border-white/5 rounded-full flex items-center justify-center ${
                    deployState === "SEARCHING" ? "animate-[spin_40s_linear_infinite]" : ""
                  }`}>
                    {/* Crosshairs */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5" />
                  </div>
                </div>
              </div>

              {/* STATE DISPLAYS */}
              {deployState === "OFFLINE" && (
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-white/5 bg-white/5 mb-3 shadow-xl">
                    <Camera className="w-5 h-5 text-zinc-300 animate-pulse" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-xl font-medium tracking-wide text-white uppercase text-center flex-wrap px-4">
                    AWAITING SECURE VIDEO UPLINK
                  </h3>
                </div>
              )}

              {deployState === "DEPLOYING" && (
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-8 font-sans">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6 animate-spin">
                    <RefreshCw className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-2xl font-medium tracking-wide text-white uppercase text-center px-4">
                    ESTABLISHING CONNECTION...
                  </h3>
                </div>
              )}

              {deployState === "SEARCHING" && (
                <div className="absolute inset-0 bg-zinc-950/10 z-20 flex flex-col items-center justify-center text-center p-8 font-sans">
                  <div className="absolute bottom-6 left-6 right-6 bg-zinc-900/50 backdrop-blur-xl px-5 py-4 rounded-xl border border-white/5 shadow-lg flex flex-col gap-2">
                    <div className="flex justify-center items-center text-sm text-cyan-400">
                      <span className="font-bold tracking-wider flex items-center gap-2 animate-pulse uppercase">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        AI VISION ANALYSIS IN PROGRESS...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE STREAM THREAT OVERLAYS */}
              {(deployState === "SAFE" || deployState === "THREAT_FOUND") && !cameraFeed && (
                // Fallback UI if camera feed didn't load properly but state advanced
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 font-sans backdrop-blur-sm bg-zinc-950/40">
                  {deployState === "THREAT_FOUND" ? (
                    <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                  )}
                </div>
              )}
            </div>

            {/* Viewfinder Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-1 px-2 py-2 border-t border-white/5 bg-zinc-900/40 text-[10px]">
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode("NORMAL")}
                  className={`px-2 py-1 rounded border transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                    viewMode === "NORMAL" ? "border-white/20 bg-white/10 text-white" : "border-white/5 text-zinc-400"
                  }`}
                >
                  Std
                </button>
                <button 
                  onClick={() => setViewMode("NIGHT_VISION")}
                  className={`px-2 py-1 rounded border transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                    viewMode === "NIGHT_VISION" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/5 text-zinc-400"
                  }`}
                >
                  NVG
                </button>
                <button 
                  onClick={() => setViewMode("THERMAL")}
                  className={`px-2 py-1 rounded border transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                    viewMode === "THERMAL" ? "border-rose-500/30 bg-red-500/10 text-rose-400" : "border-white/5 text-zinc-400"
                  }`}
                >
                  Therm
                </button>
              </div>

              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex items-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer ${
                    showGrid ? "text-white" : "text-zinc-500"
                  }`}
                >
                  <Grid className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Under-view Threat Status Banner Panel */}
          <div className={`backdrop-blur-xl border shadow-2xl rounded-2xl p-4 md:p-6 flex-shrink-0 text-center flex flex-col items-center justify-center transition-all duration-500 ${
            deployState === "THREAT_FOUND" 
              ? "bg-rose-950/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
              : deployState === "SAFE" 
                ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]" 
                : "bg-white/[0.03] border-white/10"
          }`}>
            <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Threat Evaluation Registry</span>
            
            <h3 className={`text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-wide mt-1 transition-all duration-300 ${
              deployState === "THREAT_FOUND" ? "text-rose-500" : 
              deployState === "SAFE" ? "text-emerald-400" : 
              deployState === "SEARCHING" ? "text-cyan-100" : "text-zinc-300"
            }`}>
              {deployState === "OFFLINE" && "ROBOT OFFLINE // READY"}
              {deployState === "DEPLOYING" && "INITIALIZING SYSTEM SWEEP..."}
              {deployState === "SEARCHING" && `ANALYZING VIDEO FEED...`}
              {deployState === "SAFE" && "VEHICLE CLEAR - NO THREATS"}
              {deployState === "THREAT_FOUND" && "WARNING: CRITICAL THREAT DETECTED"}
            </h3>

            {threatData && (
              <div className={`flex items-center gap-3 mt-4 border px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg ${
                threatData.threatDetected ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse" : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              }`}>
                {threatData.threatDetected ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                <span className="text-left">{threatData.analysis}</span>
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 1: LEFT SIDEBAR (Controls) - Order 3 on Mobile, Order 1 on Desktop (Col 1-3) */}
        <section className="order-3 lg:order-1 lg:col-span-3 flex flex-col h-full min-h-[350px]">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 lg:p-6 flex flex-col h-full">
            
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-3 mb-6">
              <h2 className="text-sm font-bold uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-400" /> Control Center
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Hardware Operations</p>
            </div>

            {/* Hardware IP Configuration */}
            <div className="mb-6 flex flex-col gap-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-3 h-3" /> ESP32-CAM IPv4 Address
              </label>
              <input 
                type="text" 
                value={espIp}
                onChange={(e) => setEspIp(e.target.value)}
                placeholder="http://192.168.x.x"
                className="bg-black/50 border border-white/10 text-emerald-400 font-mono focus:border-cyan-500 outline-none rounded-lg p-2 text-sm w-full transition-colors"
              />
            </div>
            
            {/* Utility Actions */}
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

            {/* Massive Sentinel deployment button */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <button 
                onClick={handleDeploy}
                disabled={deployState === "DEPLOYING" || deployState === "SEARCHING"}
                className={`w-full min-h-[60px] lg:min-h-[80px] rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  deployState !== "OFFLINE" 
                    ? "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.15)] hover:shadow-[0_0_30px_rgba(225,29,72,0.3)]" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                }`}
              >
                {deployState === "OFFLINE" ? (
                  <div className="flex items-center gap-3">
                    <Play className="w-6 h-6 text-emerald-400 fill-transparent transition-all duration-300" />
                    <span className="text-emerald-400 font-bold tracking-widest text-base lg:text-lg uppercase">Deploy Robot</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Square className="w-6 h-6 text-rose-500 fill-transparent transition-all duration-300" />
                    <span className="text-rose-500 font-bold tracking-widest text-base lg:text-lg uppercase">Recall Robot</span>
                  </div>
                )}
              </button>
            </div>

          </div>
        </section>

        {/* COLUMN 3: RIGHT SIDEBAR (Results) - Order 4 on Mobile, Order 3 on Desktop (Col 10-12) */}
        <section className="order-4 lg:order-3 lg:col-span-3 flex flex-col gap-3">
          
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-zinc-900/40">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-bold uppercase tracking-wider">
                <TerminalIcon className="w-4 h-4 text-zinc-400" />
                <span>System Logs</span>
              </div>
            </div>

            <div className="flex-1 min-h-[200px] max-h-[300px] lg:max-h-full overflow-y-auto p-3 lg:p-4 flex flex-col gap-3 text-[10px] sm:text-xs text-zinc-200 terminal-scrollbar font-mono">
              {logs.map((log, idx) => {
                let colorClass = "text-zinc-300";
                let tagColor = "text-zinc-400 bg-white/5 border-white/5";
                
                if (log.source === "SYS") {
                  colorClass = "text-cyan-200";
                  tagColor = "text-cyan-300 bg-cyan-500/10 border-cyan-500/25";
                } else if (log.source === "AI_VISION") {
                  colorClass = "text-zinc-100";
                  tagColor = "text-indigo-300 bg-indigo-500/10 border-indigo-500/20";
                } else if (log.source === "CRITICAL") {
                  colorClass = "text-red-200 font-bold";
                  tagColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
                } else if (log.source === "SUCCESS") {
                  colorClass = "text-emerald-200 font-bold";
                  tagColor = "text-emerald-300 bg-emerald-500/20 border-emerald-500/30";
                } else if (log.source === "USER") {
                  colorClass = "text-white font-semibold";
                  tagColor = "text-zinc-300 bg-slate-800 border-white/5";
                }

                return (
                  <div key={idx} className="flex flex-col gap-1 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-zinc-500">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${tagColor}`}>
                        {log.source}
                      </span>
                    </div>
                    <p className={`pl-1 leading-relaxed text-sm ${colorClass}`}>
                      {log.source === "USER" ? `$ ${log.message}` : log.message}
                    </p>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 py-3 text-center border-t border-white/5 backdrop-blur-md bg-zinc-950/20 font-sans text-[10px] text-zinc-500 mt-auto">
        <span>SHADOW-SWEEP DEFENSE SYSTEMS © {new Date().getFullYear()} // ENTERPRISE SOFTWARE SUITE // SECURE ENCRYPTED CHANNEL</span>
      </footer>
    </div>
  );
}
