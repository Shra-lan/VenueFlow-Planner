import { Coffee, Droplets, ShoppingBag, Utensils } from 'lucide-react';

interface RecommendationsProps {
  stand: string;
}

export default function Recommendations({ stand }: RecommendationsProps) {
  // Mock data tailored slightly to the stand to show personalization
  const getRecs = (s: string) => {
    const base = [
      { 
        icon: Droplets, 
        title: 'Nearest Restroom', 
        desc: `Level 1, ${s} Concourse`, 
        wait: 'No wait', 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/10' 
      },
      { 
        icon: Utensils, 
        title: 'Hot Food & Grill', 
        desc: 'Section 105 Kiosk', 
        wait: '5 min wait', 
        color: 'text-orange-400', 
        bg: 'bg-orange-500/10' 
      },
      { 
        icon: Coffee, 
        title: 'Express Drinks', 
        desc: 'Cart near Gate ' + s.charAt(0).toUpperCase(), 
        wait: '1 min wait', 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10' 
      },
      { 
        icon: ShoppingBag, 
        title: 'Merchandise', 
        desc: 'Main Store (East Wing)', 
        wait: '10 min wait', 
        color: 'text-purple-400', 
        bg: 'bg-purple-500/10' 
      }
    ];
    return base;
  };

  const recs = getRecs(stand);

  return (
    <div className="mt-8 px-4">
      <h3 className="text-lg font-bold mb-4 text-slate-100">Nearby Amenities</h3>
      
      {/* Horizontal scrolling container */}
      <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {recs.map((rec, i) => (
          <div 
            key={i} 
            className="min-w-[220px] bg-slate-900 border border-slate-800 rounded-3xl p-5 snap-start shrink-0 shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${rec.bg}`}>
                <rec.icon className={`w-6 h-6 ${rec.color}`} />
              </div>
              <div className="px-2 py-1 bg-slate-950 rounded-lg text-xs font-bold text-slate-300 border border-slate-800">
                {rec.wait}
              </div>
            </div>
            <h4 className="font-bold text-slate-200 text-lg">{rec.title}</h4>
            <p className="text-sm text-slate-400 mt-1">{rec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
