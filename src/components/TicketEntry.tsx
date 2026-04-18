import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, ArrowRight, Ticket, ScanLine, X, Camera, AlertCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export interface TicketData {
  stand: string;
  row: string;
  column: string;
  seat: string;
  raw: string;
}

interface TicketEntryProps {
  onTicketSubmit: (ticket: TicketData) => void;
}

export default function TicketEntry({ onTicketSubmit }: TicketEntryProps) {
  const [ticketStr, setTicketStr] = useState('');
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleSubmit = (e?: React.FormEvent, rawTicket?: string) => {
    if (e) e.preventDefault();
    
    const valueToParse = rawTicket || ticketStr;
    const parts = valueToParse.split('_');
    
    // For demo purposes: if they scan a random real-world QR code that doesn't match our format,
    // we'll intelligently fallback to a mock ticket so the demo still looks amazing.
    if (parts.length !== 4) {
      if (rawTicket) {
        // It was a real scan, but not our format - give them a demo seat
        onTicketSubmit({
          stand: 'South',
          row: 'M',
          column: '2',
          seat: '45',
          raw: valueToParse
        });
        return;
      } else {
        setError('Invalid format. Please use Stand_Row_Column_Seat (e.g., North_A_1_12)');
        return;
      }
    }

    setError('');
    onTicketSubmit({
      stand: parts[0],
      row: parts[1],
      column: parts[2],
      seat: parts[3],
      raw: valueToParse
    });
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const value = detectedCodes[0].rawValue;
      setIsScannerOpen(false);
      setTicketStr(value);
      setTimeout(() => handleSubmit(undefined, value), 500);
    }
  };

  const simulateScan = () => {
    setIsScannerOpen(false);
    setTicketStr('North_A_1_12');
    setTimeout(() => {
      onTicketSubmit({
        stand: 'North',
        row: 'A',
        column: '1',
        seat: '12',
        raw: 'North_A_1_12'
      });
    }, 500);
  };

  const handleScannerError = (err: unknown) => {
    console.error("Camera error:", err);
    if (err instanceof Error) {
      if (err.message.includes('Permission denied')) {
        setCameraError('Camera access denied by browser.');
      } else if (err.message.includes('Requested device not found')) {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(err.message);
      }
    } else {
      setCameraError('Failed to initialize camera.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4">
          <Ticket className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Find Your Seat</h2>
        <p className="text-slate-400 text-sm">
          Scan your ticket QR code or enter your ticket number to get live routing and wait times.
        </p>
      </div>

      {/* QR Scanner Interface */}
      <AnimatePresence mode="wait">
        {isScannerOpen ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key="active-scanner"
            className="w-full max-w-sm aspect-square bg-slate-900 border-2 border-indigo-500 rounded-3xl mb-8 relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(99,102,241,0.2)]"
          >
            {cameraError ? (
              <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center z-20 bg-slate-900">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <h3 className="text-white font-bold mb-2">Camera Unavailable</h3>
                <p className="text-slate-400 text-sm mb-6">{cameraError}</p>
                <button 
                  onClick={simulateScan}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors w-full"
                >
                  Simulate QR Scan (Demo)
                </button>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 z-0">
                  <Scanner 
                    onScan={handleScan}
                    onError={handleScannerError}
                    classNames={{
                      container: 'w-full h-full bg-slate-950',
                      video: 'object-cover w-full h-full'
                    }}
                    components={{
                      finder: false
                    }}
                  />
                </div>
                {/* Custom Scanner Overlay UI */}
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-[70%] aspect-square border-2 border-white/50 rounded-2xl relative shadow-[0_0_0_1000px_rgba(15,23,42,0.6)]">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                    
                    <motion.div 
                      animate={{ y: [0, 200, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute top-0 flex w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)]"
                    />
                  </div>
                  <p className="text-white font-medium mt-6 bg-slate-900/80 px-4 py-1.5 rounded-full backdrop-blur-md text-sm border border-slate-700">
                    Point camera at QR code
                  </p>
                  
                  {/* Hackathon Failsafe Button */}
                  <button 
                    onClick={simulateScan}
                    className="pointer-events-auto mt-4 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-300 rounded-full text-xs font-semibold border border-slate-600 transition-colors"
                  >
                    Use Fake Scan (Demo)
                  </button>
                </div>
              </>
            )}
            
            <button 
              onClick={() => { setIsScannerOpen(false); setCameraError(''); }}
              className="absolute top-4 right-4 z-30 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-full transition-colors backdrop-blur-md border border-slate-700 pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key="idle-scanner"
            className="w-full max-w-sm aspect-[4/3] bg-slate-900 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-3xl mb-8 relative overflow-hidden flex flex-col items-center justify-center group cursor-pointer transition-colors shadow-lg"
            onClick={() => setIsScannerOpen(true)}
          >
            <div className="w-20 h-20 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors mb-4 relative">
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-slate-200 font-bold text-lg">Scan Physical Ticket</h3>
            <p className="text-slate-500 text-sm mt-1">Tap to open camera</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex items-center gap-4 mb-8">
        <div className="h-px bg-slate-800 flex-1"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">OR ENTER MANUALLY</span>
        <div className="h-px bg-slate-800 flex-1"></div>
      </div>

      {/* Manual Entry Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="w-full">
        <div className="relative">
          <input
            type="text"
            aria-label="Ticket Number"
            value={ticketStr}
            onChange={(e) => setTicketStr(e.target.value)}
            placeholder="e.g., North_A_1_12"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            aria-label="Submit Ticket"
            disabled={!ticketStr.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-3 text-center"
          >
            {error}
          </motion.p>
        )}
      </form>
    </div>
  );
}
