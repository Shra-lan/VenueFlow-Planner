import { motion } from 'motion/react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface StadiumMapProps {
  highlightStand?: string;
}

export default function StadiumMap({ highlightStand }: StadiumMapProps) {
  const stands = [
    { id: 'north', name: 'North Stand', x: 100, y: 40, width: 200, height: 80, rx: 20 },
    { id: 'south', name: 'South Stand', x: 100, y: 480, width: 200, height: 80, rx: 20 },
    { id: 'west', name: 'West Stand', x: 20, y: 140, width: 60, height: 320, rx: 20 },
    { id: 'east', name: 'East Stand', x: 320, y: 140, width: 60, height: 320, rx: 20 },
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

  const activePath = highlightStand ? getPathForStand(highlightStand) : "";

  return (
    <div className="relative w-full aspect-[3/4] max-h-[50vh] mx-auto flex items-center justify-center p-4 bg-slate-900/30 rounded-3xl overflow-hidden border border-slate-800/50">
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
              <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl cursor-grab active:cursor-grabbing">
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
                  const isTargetGate = highlightStand && gate.id.toLowerCase().includes(highlightStand.charAt(0).toLowerCase());
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
                <rect x="100" y="140" width="200" height="320" rx="10" className="fill-emerald-900/40 stroke-emerald-500/50 stroke-2" />
                
                {/* Pitch Markings */}
                <line x1="100" y1="300" x2="300" y2="300" className="stroke-emerald-500/30 stroke-2" />
                <circle cx="200" cy="300" r="40" className="fill-transparent stroke-emerald-500/30 stroke-2" />
                <rect x="140" y="140" width="120" height="40" className="fill-transparent stroke-emerald-500/30 stroke-2" />
                <rect x="140" y="420" width="120" height="40" className="fill-transparent stroke-emerald-500/30 stroke-2" />

                {/* Stands */}
                {stands.map((stand) => {
                  const isHighlighted = highlightStand?.toLowerCase() === stand.id;
                  const cx = stand.x + stand.width / 2;
                  const cy = stand.y + stand.height / 2;
                  const rotation = stand.id === 'west' ? -90 : stand.id === 'east' ? 90 : 0;
                  
                  return (
                    <motion.g 
                      key={stand.id}
                      initial={{ opacity: 1 }}
                      animate={{
                        opacity: highlightStand ? (isHighlighted ? 1 : 0.3) : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <rect
                        x={stand.x}
                        y={stand.y}
                        width={stand.width}
                        height={stand.height}
                        rx={stand.rx}
                        className={`stroke-2 transition-colors duration-500 ${
                          isHighlighted 
                            ? 'fill-indigo-500/40 stroke-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                            : 'fill-slate-800/50 stroke-slate-700'
                        }`}
                      />
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}
                        className={`text-xs font-semibold tracking-wider pointer-events-none ${
                          isHighlighted ? 'fill-white' : 'fill-slate-400'
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
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
