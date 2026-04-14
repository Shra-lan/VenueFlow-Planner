import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, CornerUpLeft, CornerUpRight, MapPin, X, Navigation2, CheckCircle2 } from 'lucide-react';
import { TicketData } from './TicketEntry';

interface IndoorNavigationProps {
  ticket: TicketData;
  onExit: () => void;
}

export default function IndoorNavigation({ ticket, onExit }: IndoorNavigationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Generate route steps based on the stand
  const getRouteSteps = (stand: string) => {
    const s = stand.toLowerCase();
    if (s === 'north') {
      return [
        { instruction: 'Enter Gate N', subtext: 'Scan ticket at turnstile 4', icon: ArrowUp, x: 200, y: 15, rotate: 0 },
        { instruction: 'Walk straight', subtext: 'Proceed 50m into the main concourse', icon: ArrowUp, x: 200, y: 60, rotate: 0 },
        { instruction: 'Turn left', subtext: 'Towards Section 112', icon: CornerUpLeft, x: 150, y: 60, rotate: 90 },
        { instruction: 'Arrive at Seat', subtext: `Row ${ticket.row}, Seat ${ticket.seat}`, icon: MapPin, x: 150, y: 40, rotate: 0 },
      ];
    }
    if (s === 'south') {
      return [
        { instruction: 'Enter Gate S', subtext: 'Scan ticket at turnstile 1', icon: ArrowUp, x: 200, y: 585, rotate: 180 },
        { instruction: 'Walk straight', subtext: 'Proceed 50m into the main concourse', icon: ArrowUp, x: 200, y: 540, rotate: 180 },
        { instruction: 'Turn right', subtext: 'Towards Section 134', icon: CornerUpRight, x: 150, y: 540, rotate: 90 },
        { instruction: 'Arrive at Seat', subtext: `Row ${ticket.row}, Seat ${ticket.seat}`, icon: MapPin, x: 150, y: 500, rotate: 180 },
      ];
    }
    if (s === 'west') {
      return [
        { instruction: 'Enter Gate W', subtext: 'Scan ticket at turnstile 2', icon: ArrowUp, x: 10, y: 300, rotate: -90 },
        { instruction: 'Walk straight', subtext: 'Proceed 30m into the concourse', icon: ArrowUp, x: 60, y: 300, rotate: -90 },
        { instruction: 'Turn left', subtext: 'Towards Section 122', icon: CornerUpLeft, x: 60, y: 250, rotate: 0 },
        { instruction: 'Arrive at Seat', subtext: `Row ${ticket.row}, Seat ${ticket.seat}`, icon: MapPin, x: 40, y: 250, rotate: -90 },
      ];
    }
    // Default / East
    return [
      { instruction: 'Enter Gate E', subtext: 'Scan ticket at turnstile 8', icon: ArrowUp, x: 390, y: 300, rotate: 90 },
      { instruction: 'Walk straight', subtext: 'Proceed 30m into the concourse', icon: ArrowUp, x: 340, y: 300, rotate: 90 },
      { instruction: 'Turn right', subtext: 'Towards Section 105', icon: CornerUpRight, x: 340, y: 250, rotate: 0 },
      { instruction: 'Arrive at Seat', subtext: `Row ${ticket.row}, Seat ${ticket.seat}`, icon: MapPin, x: 360, y: 250, rotate: 90 },
    ];
  };

  const steps = getRouteSteps(ticket.stand);
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const CurrentIcon = currentStepData.icon;

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  // Calculate the SVG path string up to the current step
  const pathString = steps.slice(0, currentStep + 1).map((step, i) => 
    `${i === 0 ? 'M' : 'L'} ${step.x} ${step.y}`
  ).join(' ');

  // Calculate the remaining path (faded)
  const remainingPathString = steps.slice(currentStep).map((step, i) => 
    `${i === 0 ? 'M' : 'L'} ${step.x} ${step.y}`
  ).join(' ');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top Navigation Header (Google Maps Style) */}
      <div className="bg-emerald-600 text-white pt-12 pb-6 px-4 shadow-2xl z-20 relative">
        <button 
          onClick={onExit}
          className="absolute top-12 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-4 mt-4"
          >
            <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center shrink-0">
              <CurrentIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-tight">{currentStepData.instruction}</h2>
              <p className="text-emerald-100 font-medium mt-1">{currentStepData.subtext}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2.5D Map Container */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0f1c]" style={{ perspective: '1000px' }}>
        
        {/* Map Layer */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center origin-center"
          animate={{ 
            rotateX: 55, // Tilt for 2.5D effect
            scale: 2.5,  // Zoom in
            // Pan the map opposite to the user's position to keep them centered
            x: (200 - currentStepData.x) * 2,
            y: (300 - currentStepData.y) * 2,
            // Rotate the map so the user is always facing "up"
            rotateZ: -currentStepData.rotate 
          }}
          transition={{ duration: 1, type: "spring", bounce: 0.2 }}
        >
          <svg viewBox="0 0 400 600" className="w-[400px] h-[600px] drop-shadow-2xl overflow-visible">
            {/* Background / Outer Stadium */}
            <rect x="5" y="5" width="390" height="590" rx="60" className="fill-slate-900 stroke-slate-800 stroke-2" />
            
            {/* The Pitch */}
            <rect x="100" y="140" width="200" height="320" rx="10" className="fill-emerald-900/20 stroke-emerald-500/30 stroke-2" />
            <line x1="100" y1="300" x2="300" y2="300" className="stroke-emerald-500/20 stroke-2" />
            <circle cx="200" cy="300" r="40" className="fill-transparent stroke-emerald-500/20 stroke-2" />

            {/* Stands Outlines */}
            <rect x="100" y="40" width="200" height="80" rx="20" className="fill-slate-800/50 stroke-slate-700" />
            <rect x="100" y="480" width="200" height="80" rx="20" className="fill-slate-800/50 stroke-slate-700" />
            <rect x="20" y="140" width="60" height="320" rx="20" className="fill-slate-800/50 stroke-slate-700" />
            <rect x="320" y="140" width="60" height="320" rx="20" className="fill-slate-800/50 stroke-slate-700" />

            {/* Future Path (Faded) */}
            <path 
              d={remainingPathString} 
              fill="transparent" 
              strokeWidth="6" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-slate-700" 
            />

            {/* Traveled Path (Bright Blue) */}
            <motion.path 
              d={pathString} 
              fill="transparent" 
              strokeWidth="6" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* User Location Dot */}
            <motion.g
              animate={{ x: currentStepData.x, y: currentStepData.y }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            >
              {/* Pulse effect */}
              <circle r="15" className="fill-blue-500/30 animate-ping" />
              {/* Core dot */}
              <circle r="6" className="fill-white stroke-blue-500 stroke-[3px] drop-shadow-lg" />
              {/* Directional Cone */}
              <path d="M -8 2 L 0 -12 L 8 2 Z" className="fill-blue-500" transform={`translate(0, -8)`} />
            </motion.g>

            {/* Destination Marker */}
            {isLastStep && (
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                transform={`translate(${steps[steps.length-1].x}, ${steps[steps.length-1].y - 15})`}
              >
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
              </motion.g>
            )}
          </svg>
        </motion.div>

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-950 p-6 pb-10 z-20 border-t border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-emerald-400">
              {isLastStep ? 'Arrived' : `${steps.length - currentStep} min`}
            </span>
            <span className="text-slate-400 text-sm">
              {isLastStep ? 'You have reached your seat' : 'Estimated time to seat'}
            </span>
          </div>
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx <= currentStep ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-4 rounded-2xl bg-slate-800 text-slate-300 font-bold disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          
          {isLastStep ? (
            <button 
              onClick={onExit}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/50"
            >
              <CheckCircle2 className="w-5 h-5" />
              Finish Navigation
            </button>
          ) : (
            <button 
              onClick={nextStep}
              className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/50"
            >
              Next Step
              <Navigation2 className="w-5 h-5 rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
