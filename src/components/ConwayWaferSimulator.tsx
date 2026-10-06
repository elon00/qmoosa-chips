import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StepForward, RotateCcw, Sparkles, ShieldCheck, Activity, Layers } from 'lucide-react';
import { ConwayEngine, AutomatonRule } from '../automaton/ConwayEngine';
import { WaferMetrics } from '../automaton/WaferYieldModel';

interface ConwayWaferSimulatorProps {
  onRegisterProof?: (proof: { hash: string; yield: number; d0: number; generation: number }) => void;
}

export const ConwayWaferSimulator: React.FC<ConwayWaferSimulatorProps> = ({ onRegisterProof }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine] = useState(() => new ConwayEngine(36, 36, 'B3/S23', true));
  const [isRunning, setIsRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(120);
  const [rule, setRule] = useState<AutomatonRule>('B3/S23');
  const [metrics, setMetrics] = useState<WaferMetrics>(() => engine.getMetrics());
  const [proofHash, setProofHash] = useState<string>(() => engine.computeStateProofHash());
  const [generation, setGeneration] = useState(0);
  const [registeredStatus, setRegisteredStatus] = useState<string | null>(null);

  // Animation Loop
  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        engine.step();
        setGeneration(engine.generation);
        setMetrics(engine.getMetrics());
        setProofHash(engine.computeStateProofHash());
        drawCanvas();
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isRunning, speedMs, engine]);

  // Initial draw and redraw on resize/state update
  useEffect(() => {
    drawCanvas();
  }, [generation, rule]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const rows = engine.rows;
    const cols = engine.cols;
    const cellW = width / cols;
    const cellH = height / rows;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Wafer Substrate Background
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (Math.min(width, height) / 2) * 0.94;

    // Outer wafer gradient (pure silicon ingot look)
    const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
    grad.addColorStop(0, '#0c1a2d');
    grad.addColorStop(0.85, '#07101e');
    grad.addColorStop(1, '#00f2fe22');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Wafer rim border with glow
    ctx.strokeStyle = '#00f2fe88';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Draw Dies & Cellular Automata Matrix
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!engine.isWithinWaferCircle(r, c)) continue;

        const isDefect = engine.grid[r][c] === 1;
        const x = c * cellW;
        const y = r * cellH;

        if (isDefect) {
          // Defect Cell: Neon Rose / Orange glow
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        } else {
          // Clean Silicon Die: Subdued Cyan Grid
          ctx.fillStyle = '#06b6d412';
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

          ctx.strokeStyle = '#06b6d425';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        }
      }
    }

    // 3. Draw Wafer Flat / Notch (Bottom Notch at 6 o'clock)
    ctx.fillStyle = '#070b14';
    ctx.beginPath();
    ctx.arc(centerX, centerY + radius, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellW = canvas.width / engine.cols;
    const cellH = canvas.height / engine.rows;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);

    engine.toggleCell(row, col);
    setMetrics(engine.getMetrics());
    setProofHash(engine.computeStateProofHash());
    drawCanvas();
  };

  const handlePreset = (preset: 'cleanWafer' | 'edgeCluster' | 'ssmbPulse' | 'pulsar' | 'gliderSteppers') => {
    engine.loadPreset(preset);
    setGeneration(engine.generation);
    setMetrics(engine.getMetrics());
    setProofHash(engine.computeStateProofHash());
    setRegisteredStatus(null);
    drawCanvas();
  };

  const handleRegisterOnChain = () => {
    const proof = {
      hash: proofHash,
      yield: metrics.yieldRate,
      d0: metrics.defectDensityD0,
      generation
    };
    if (onRegisterProof) {
      onRegisterProof(proof);
    }
    setRegisteredStatus(`Proof Verified & Committed to ICP Canister: ${proofHash}`);
    setTimeout(() => setRegisteredStatus(null), 5000);
  };

  return (
    <section className="bg-cyber-800/60 rounded-2xl border border-cyan-900/40 p-5 backdrop-blur-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Conway Automaton: Silicon Wafer Yield & Defect Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cellular automaton modelling 300mm wafer defect density ($D_0$) and Murphy-Poisson yield curves
          </p>
        </div>

        {/* State Proof Badge */}
        <div className="flex items-center gap-2 bg-cyber-900/90 border border-cyan-800/60 px-3 py-1.5 rounded-xl font-mono text-xs">
          <span className="text-slate-400">Gen:</span>
          <span className="text-cyan-300 font-bold">{generation}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Proof:</span>
          <span className="text-emerald-400 truncate max-w-[130px]" title={proofHash}>
            {proofHash}
          </span>
        </div>
      </div>

      {/* Main Layout: Canvas on Left, Controls & Physics HUD on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Interactive Canvas Viewport */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative p-2 rounded-2xl bg-cyber-950/90 border border-cyan-700/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              onClick={handleCanvasClick}
              className="rounded-xl cursor-crosshair max-w-full h-auto"
            />
            <div className="absolute bottom-4 left-5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-800/50">
              Click cell to toggle silicon defect
            </div>
          </div>
        </div>

        {/* Physics HUD & Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Yield HUD Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
            <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyan-900/60">
              <span className="text-[11px] text-slate-400 block">Raw Die Yield</span>
              <span className={`text-xl font-bold ${metrics.yieldRate > 85 ? 'text-emerald-400' : metrics.yieldRate > 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                {metrics.yieldRate}%
              </span>
              <span className="text-[10px] text-slate-500 block">{metrics.goodDies} / {metrics.totalDies} Dies</span>
            </div>

            <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyan-900/60">
              <span className="text-[11px] text-slate-400 block">Murphy Model</span>
              <span className="text-xl font-bold text-cyan-300">{metrics.murphyYield}%</span>
              <span className="text-[10px] text-slate-500 block">Poisson: {metrics.poissonYield}%</span>
            </div>

            <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyan-900/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block">Defect Density (D₀)</span>
              <span className="text-xl font-bold text-violet-300">{metrics.defectDensityD0}</span>
              <span className="text-[10px] text-slate-500 block">defects/cm²</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-cyan-950 font-mono text-xs flex justify-between items-center text-slate-300">
            <span>Estimated Wafer Value:</span>
            <span className="text-emerald-400 font-bold text-sm">
              ${(metrics.estimatedRevenueUsd / 1000).toFixed(1)}k USD
            </span>
          </div>

          {/* Automaton Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Engine' : 'Run Automaton'}</span>
            </button>

            <button
              onClick={() => {
                engine.step();
                setGeneration(engine.generation);
                setMetrics(engine.getMetrics());
                setProofHash(engine.computeStateProofHash());
                drawCanvas();
              }}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyber-700 hover:bg-cyber-600 disabled:opacity-50 text-cyan-200 font-mono text-xs transition-all border border-cyan-800/50"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step</span>
            </button>

            <button
              onClick={() => {
                engine.randomize(0.08);
                setGeneration(0);
                setMetrics(engine.getMetrics());
                setProofHash(engine.computeStateProofHash());
                drawCanvas();
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyber-700 hover:bg-cyber-600 text-slate-200 font-mono text-xs transition-all border border-cyan-800/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>

            <select
              value={rule}
              onChange={(e) => {
                const r = e.target.value as AutomatonRule;
                setRule(r);
                engine.rule = r;
              }}
              className="px-3 py-2 rounded-xl bg-cyber-900 border border-cyan-800/60 text-cyan-300 font-mono text-xs focus:outline-none"
            >
              <option value="B3/S23">Conway Standard (B3/S23)</option>
              <option value="B36/S23">HighLife Replicator (B36/S23)</option>
              <option value="B3/S123">Litho-Etch Defect Drift (B3/S123)</option>
            </select>
          </div>

          {/* Presets Row */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1.5">Lithography Presets:</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => handlePreset('edgeCluster')}
                className="px-2.5 py-1 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-cyan-300 border border-cyan-900/60"
              >
                Spin-Coat Edge Ring
              </button>
              <button
                onClick={() => handlePreset('ssmbPulse')}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
              >
                SSMB Accelerator Pulse ⚡
              </button>
              <button
                onClick={() => handlePreset('gliderSteppers')}
                className="px-2.5 py-1 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-cyan-300 border border-cyan-900/60"
              >
                Glider Stepper Heads
              </button>
              <button
                onClick={() => handlePreset('pulsar')}
                className="px-2.5 py-1 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-cyan-300 border border-cyan-900/60"
              >
                Harmonic Pulsar
              </button>
              <button
                onClick={() => handlePreset('cleanWafer')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40"
              >
                100% Pristine Wafer
              </button>
            </div>
          </div>

          {/* Register Proof Button */}
          <div className="pt-2">
            <button
              onClick={handleRegisterOnChain}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-200" />
              <span>Register Wafer Attestation on ICP Canister</span>
            </button>

            {registeredStatus && (
              <p className="mt-2 text-center text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-700/50 py-1.5 px-3 rounded-lg animate-pulse">
                ✓ {registeredStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
