import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, Activity, X } from 'lucide-react';

interface StadiumMapProps {
  highlightStand?: string;
}

export default function StadiumMap({ highlightStand }: StadiumMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [seatView, setSeatView] = useState<typeof stands[0] | null>(null);
  const [densities, setDensities] = useState<Record<string, number>>({
    north: 0.8,
    south: 0.3,
    west: 0.6,
    east: 0.2,
    pitch: 0.5,
  });

  // Simulate live updating data when heatmap is active
  useEffect(() => {
    if (!showHeatmap) return;
    const interval = setInterval(() => {
      setDensities(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          // Adjust density randomly by -0.15 to +0.15, keeping it between 0.1 and 1.0
          const change = (Math.random() - 0.5) * 0.3;
          next[key] = Math.max(0.1, Math.min(1.0, next[key] + change));
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [showHeatmap]);

  // Returns a color from Green (low) to Red (high) based on density
  const getHeatmapColor = (density: number) => {
    const hue = (1 - density) * 120; // 120 is green, 0 is red
    return `hsla(${hue}, 100%, 50%, 0.6)`;
  };

  const stands = [
    { id: 'north', name: 'North Stand', x: 100, y: 40, width: 200, height: 80, rx: 20, img: "https://upload.wikimedia.org/wikipedia/commons/1/16/Wembley_Stadium_interior.jpg" },
    { id: 'south', name: 'South Stand', x: 100, y: 480, width: 200, height: 80, rx: 20, img: "https://upload.wikimedia.org/wikipedia/commons/7/79/Wembley_Stadium%2C_London.jpg" },
    { id: 'west', name: 'West Stand', x: 20, y: 140, width: 60, height: 320, rx: 20, img: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Stamford_Bridge_-_West_Stand.jpg" },
    { id: 'east', name: 'East Stand', x: 320, y: 140, width: 60, height: 320, rx: 20, img: "https://upload.wikimedia.org/wikipedia/commons/4/43/Old_Trafford_inside_20060726_1.jpg" },
  ];

  // Map gates to their approximate positions
  const gates = [
    { id: 'Gate N', x: 200, y: 15 },
    { id: 'Gate S', x: 200, y: 585 },
    { id: 'Gate W', x: 10, y: 300 },
    { id: 'Gate E', x: 390, y: 300 },
  ];

  // Define paths from gates to stands
  const getPathForStand = (standId: string) => {
    switch (standId.toLowerCase()) {
      case 'north': return "M 200 15 L 200 80";
      case 'south': return "M 200 585 L 200 520";
      case 'west': return "M 10 300 L 50 300";
      case 'east': return "M 390 300 L 350 300";
      default: return "";
    }
  };

  const activePath = highlightStand && !showHeatmap ? getPathForStand(highlightStand) : "";

  return (
    <div className="relative w-full aspect-[3/4] max-h-[50vh] mx-auto flex items-center justify-center bg-slate-900/30 rounded-3xl overflow-hidden border border-slate-800/50">
      
      {/* Live Density Toggle */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-lg backdrop-blur-md border ${
            showHeatmap 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/20' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Activity className={`w-4 h-4 ${showHeatmap ? 'animate-pulse' : ''}`} />
          {showHeatmap ? 'LIVE CROWD DENSITY' : 'SHOW DENSITY'}
        </button>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button 
                onClick={() => zoomIn()} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-full text-slate-300 transition-colors shadow-lg"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => zoomOut()} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-full text-slate-300 transition-colors shadow-lg"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => resetTransform()} 
                className="p-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-full text-slate-300 transition-colors shadow-lg"
                aria-label="Reset Zoom"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>

            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
              <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl cursor-grab active:cursor-grabbing pb-8">
                
                {/* Defs for Glow Filter */}
                <defs>
                  <filter id="heatmap-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background / Outer Stadium */}
                <rect x="5" y="5" width="390" height="590" rx="60" className="fill-slate-900 stroke-slate-800 stroke-2" />
                
                {/* Animated Routing Path */}
                {activePath && (
                  <motion.path
                    d={activePath}
                    fill="transparent"
                    strokeWidth="4"
                    strokeDasharray="8 8"
                    className="stroke-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                  />
                )}

                {/* Gates */}
                {gates.map(gate => {
                  const isTargetGate = highlightStand && !showHeatmap && gate.id.toLowerCase().includes(highlightStand.charAt(0).toLowerCase());
                  return (
                    <g key={gate.id}>
                      <circle 
                        cx={gate.x} 
                        cy={gate.y} 
                        r="12" 
                        className={`stroke-2 transition-colors duration-300 ${
                          isTargetGate ? 'fill-indigo-500 stroke-indigo-300' : 'fill-slate-800 stroke-slate-600'
                        }`} 
                      />
                      <text x={gate.x} y={gate.y} textAnchor="middle" alignmentBaseline="middle" className="fill-slate-200 text-[8px] font-bold">
                        {gate.id.split(' ')[1]}
                      </text>
                      {isTargetGate && (
                        <circle cx={gate.x} cy={gate.y} r="16" className="fill-transparent stroke-indigo-400 stroke-2 animate-ping" />
                      )}
                    </g>
                  );
                })}

                {/* The Pitch */}
                <g>
                  <rect x="100" y="140" width="200" height="320" rx="10" className="fill-emerald-900/40 stroke-emerald-500/50 stroke-2" />
                  
                  {/* Heatmap overlay for Pitch */}
                  <AnimatePresence>
                    {showHeatmap && (
                      <motion.rect
                        x="100" y="140" width="200" height="320" rx="10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, fill: getHeatmapColor(densities.pitch) }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        filter="url(#heatmap-blur)"
                        className="mix-blend-screen"
                      />
                    )}
                  </AnimatePresence>

                  {/* Pitch Markings OVER the heatmap */}
                  <line x1="100" y1="300" x2="300" y2="300" className="stroke-emerald-500/30 stroke-2 pointer-events-none" />
                  <circle cx="200" cy="300" r="40" className="fill-transparent stroke-emerald-500/30 stroke-2 pointer-events-none" />
                  <rect x="140" y="140" width="120" height="40" className="fill-transparent stroke-emerald-500/30 stroke-2 pointer-events-none" />
                  <rect x="140" y="420" width="120" height="40" className="fill-transparent stroke-emerald-500/30 stroke-2 pointer-events-none" />
                </g>

                {/* Stands */}
                {stands.map((stand) => {
                  const isHighlighted = highlightStand?.toLowerCase() === stand.id && !showHeatmap;
                  const cx = stand.x + stand.width / 2;
                  const cy = stand.y + stand.height / 2;
                  const rotation = stand.id === 'west' ? -90 : stand.id === 'east' ? 90 : 0;
                  
                  return (
                    <motion.g 
                      key={stand.id}
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: highlightStand && !showHeatmap ? (isHighlighted ? 1 : 0.3) : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Base Stand Rectangle */}
                      <rect
                        x={stand.x}
                        y={stand.y}
                        width={stand.width}
                        height={stand.height}
                        rx={stand.rx}
                        onClick={() => setSeatView(stand)}
                        className={`stroke-2 cursor-pointer transition-colors duration-500 hover:brightness-125 ${
                          isHighlighted 
                            ? 'fill-indigo-500/40 stroke-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                            : 'fill-slate-800/50 stroke-slate-700'
                        }`}
                      />

                      {/* Heatmap Overlay */}
                      <AnimatePresence>
                        {showHeatmap && (
                          <motion.rect
                            x={stand.x}
                            y={stand.y}
                            width={stand.width}
                            height={stand.height}
                            rx={stand.rx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, fill: getHeatmapColor(densities[stand.id]) }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            filter="url(#heatmap-blur)"
                            className="mix-blend-screen pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}
                        className={`text-xs font-semibold tracking-wider pointer-events-none drop-shadow-md ${
                          isHighlighted || showHeatmap ? 'fill-white' : 'fill-slate-400'
                        }`}
                      >
                        {stand.name}
                      </text>
                      
                      {/* Highlight Pulse */}
                      {isHighlighted && (
                        <circle 
                          cx={cx} 
                          cy={stand.id === 'north' ? stand.y + stand.height - 15 : stand.id === 'south' ? stand.y + 15 : cy} 
                          r="4" 
                          className="fill-indigo-400 animate-pulse" 
                        />
                      )}
                    </motion.g>
                  );
                })}
              </svg>
            </TransformComponent>

            {/* View From Seat Overlay */}
            <AnimatePresence>
              {seatView && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute inset-x-0 bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-50 flex items-center justify-center px-4 md:px-8 pointer-events-auto"
                >
                  <div className="bg-[#333333] w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden ring-1 ring-white/10">
                    {/* Header simulating the Ticketmaster-style UI */}
                    <div className="relative py-4 flex items-center justify-center bg-[#333333] border-b border-[#222]">
                      <h3 className="text-white text-lg font-light tracking-wide">
                        Section <span className="font-bold">
                          {seatView.id === 'north' ? '123' : seatView.id === 'south' ? '532' : seatView.id === 'east' ? '204' : '101'}
                        </span>
                      </h3>
                      <button 
                        onClick={() => setSeatView(null)} 
                        className="absolute right-4 p-1 rounded-full text-slate-300 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6"/>
                      </button>
                    </div>
                    {/* Static Image View From Seat (matches reference image) */}
                    <div className="relative aspect-video w-full bg-black">
                      <img 
                        src={seatView.img} 
                        alt={`View from ${seatView.name}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
