import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, ArrowRight, Ticket, ScanLine } from 'lucide-react';

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
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const parts = ticketStr.split('_');
    if (parts.length !== 4) {
      setError('Invalid format. Please use Stand_Row_Column_Seat (e.g., North_A_1_12)');
      return;
    }

    setError('');
    onTicketSubmit({
      stand: parts[0],
      row: parts[1],
      column: parts[2],
      seat: parts[3],
      raw: ticketStr
    });
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setTicketStr('North_A_1_12');
      setIsScanning(false);
      // Auto submit after a short delay to show the scanned text
      setTimeout(() => {
        onTicketSubmit({
          stand: 'North',
          row: 'A',
          column: '1',
          seat: '12',
          raw: 'North_A_1_12'
        });
      }, 800);
    }, 2000);
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

      {/* QR Scanner Mock */}
      <div className="w-full max-w-xs aspect-square bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl mb-8 relative overflow-hidden flex flex-col items-center justify-center group">
        {isScanning ? (
          <>
            <motion.div 
              animate={{ y: [0, 250, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
            />
            <ScanLine className="w-12 h-12 text-emerald-500 animate-pulse" />
            <p className="text-emerald-500 font-medium mt-4 text-sm">Scanning...</p>
          </>
        ) : (
          <>
            <QrCode className="w-16 h-16 text-slate-600 group-hover:text-indigo-400 transition-colors mb-4" />
            <button 
              onClick={simulateScan}
              aria-label="Tap to Scan Ticket"
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-sm font-medium transition-colors"
            >
              Tap to Scan Ticket
            </button>
          </>
        )}
      </div>

      <div className="w-full flex items-center gap-4 mb-8">
        <div className="h-px bg-slate-800 flex-1"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">OR ENTER MANUALLY</span>
        <div className="h-px bg-slate-800 flex-1"></div>
      </div>

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="w-full">
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
