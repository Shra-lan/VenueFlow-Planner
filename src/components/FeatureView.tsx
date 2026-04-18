import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

interface FeatureItem {
  name: string;
  location: string;
  status: string;
}

interface FeatureViewProps {
  title: string;
  icon: React.ElementType;
  items: FeatureItem[];
  onBack?: () => void;
}

export default function FeatureView({ title, icon: Icon, items, onBack }: FeatureViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-6"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-row items-center gap-4 hover:border-slate-700 transition-colors">
            <div className="flex-1">
              <h3 className="font-bold text-slate-200 text-lg">{item.name}</h3>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
              item.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              item.status === 'Busy' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
              'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
      {onBack && (
        <button 
          onClick={onBack}
          className="w-full mt-8 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-colors"
        >
          Go Back
        </button>
      )}
    </motion.div>
  );
}
