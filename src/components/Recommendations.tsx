import React, { useState, useEffect } from 'react';
import { Coffee, Droplets, ShoppingBag, Utensils, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface RecommendationsProps {
  stand: string;
}

interface RecItem {
  type: string;
  title: string;
  desc: string;
  wait: string;
}

const IconMap: Record<string, React.ElementType> = {
  'Droplets': Droplets,
  'Utensils': Utensils,
  'Coffee': Coffee,
  'ShoppingBag': ShoppingBag
};

const ColorMap: Record<string, { color: string, bg: string }> = {
  'Droplets': { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'Utensils': { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Coffee': { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'ShoppingBag': { color: 'text-purple-400', bg: 'bg-purple-500/10' }
};

export default function Recommendations({ stand }: RecommendationsProps) {
  const [recs, setRecs] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const prompt = `You are a real-time smart stadium AI for Wembley Stadium.
Generate exactly 4 customized, hyper-realistic, nearby venue amenities (Food, Restroom, Merch, Drinks) relative to the "${stand}" stand.
Return ONLY a valid JSON array of objects with these keys:
- type: (Must be exactly one of: "Droplets", "Utensils", "Coffee", "ShoppingBag")
- title: (Short compelling name, e.g. "Grill 105")
- desc: (Location description, e.g. "Level 1, ${stand} Concourse")
- wait: (Realistic wait time, e.g. "5 min wait" or "No wait")`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            temperature: 0.8,
            responseMimeType: "application/json",
          }
        });

        const jsonStr = response.text || "";
        const data = JSON.parse(jsonStr);
        setRecs(data);
      } catch (err) {
        console.error("AI Gen Failed:", err);
        setRecs([
          { type: 'Droplets', title: 'Nearest Restroom', desc: `Level 1, ${stand} Concourse`, wait: 'No wait' },
          { type: 'Utensils', title: 'Hot Food & Grill', desc: 'Section 105 Kiosk', wait: '5 min wait' },
          { type: 'Coffee', title: 'Express Drinks', desc: `Cart near Gate ${stand.charAt(0)}`, wait: '1 min wait' },
          { type: 'ShoppingBag', title: 'Merchandise', desc: 'Main Store', wait: '10 min wait' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [stand]);

  if (loading) {
    return (
      <div className="mt-8 px-4 flex flex-col items-center justify-center py-12 border border-slate-800 rounded-3xl bg-slate-900/50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm animate-pulse">Generating personalized amenities layout...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 px-4">
      <h3 className="text-lg font-bold mb-4 text-slate-100">Nearby Amenities</h3>
      
      {/* Horizontal scrolling container */}
      <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {recs.map((rec, i) => {
          const IconComponent = IconMap[rec.type] || Coffee;
          const styles = ColorMap[rec.type] || ColorMap['Utensils'];

          return (
            <div 
              key={i} 
              className="min-w-[220px] bg-slate-900 border border-slate-800 rounded-3xl p-5 snap-start shrink-0 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.bg}`}>
                  <IconComponent className={`w-6 h-6 ${styles.color}`} />
                </div>
                <div className="px-2 py-1 bg-slate-950 rounded-lg text-xs font-bold text-slate-300 border border-slate-800">
                  {rec.wait}
                </div>
              </div>
              <h4 className="font-bold text-slate-200 text-lg">{rec.title}</h4>
              <p className="text-sm text-slate-400 mt-1">{rec.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
