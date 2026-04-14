import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Radio, Clock, AlertTriangle, CheckCircle2, Users, Send } from 'lucide-react';

interface GateStatus {
  id: string;
  name: string;
  waitTime: number;
  status: 'normal' | 'busy' | 'closed';
}

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  time: string;
}

export default function StaffDashboard() {
  const [gates, setGates] = useState<GateStatus[]>([
    { id: 'n', name: 'Gate N', waitTime: 5, status: 'normal' },
    { id: 's', name: 'Gate S', waitTime: 12, status: 'busy' },
    { id: 'e', name: 'Gate E', waitTime: 2, status: 'normal' },
    { id: 'w', name: 'Gate W', waitTime: 8, status: 'normal' },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', message: 'South Stand concessions experiencing high volume.', type: 'warning', time: '10:42 AM' },
  ]);

  const [newAlertMsg, setNewAlertMsg] = useState('');
  const [newAlertType, setNewAlertType] = useState<'info' | 'warning' | 'critical'>('info');

  const handleUpdateWaitTime = (id: string, newTime: number) => {
    setGates(gates.map(g => g.id === id ? { ...g, waitTime: newTime, status: newTime > 10 ? 'busy' : 'normal' } : g));
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertMsg.trim()) return;
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      message: newAlertMsg,
      type: newAlertType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setAlerts([newAlert, ...alerts]);
    setNewAlertMsg('');
  };

  const getStatusColor = (status: string) => {
    if (status === 'normal') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'busy') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Command Center</h1>
              <p className="text-slate-400 text-sm">VenueFlow Staff Dashboard • Wembley Stadium</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-400">System Online</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Gate Management */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Live Gate Wait Times</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gates.map(gate => (
                  <div key={gate.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{gate.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(gate.status)}`}>
                        {gate.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="45" 
                        value={gate.waitTime}
                        onChange={(e) => handleUpdateWaitTime(gate.id, parseInt(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <div className="w-16 text-right font-mono text-xl text-indigo-400 font-bold">
                        {gate.waitTime}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Zone Status (Mock) */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Zone Density</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['North', 'South', 'East', 'West'].map((stand, i) => (
                  <div key={stand} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="text-slate-400 text-sm mb-2">{stand} Stand</div>
                    <div className={`text-lg font-bold ${i === 1 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {i === 1 ? '85%' : '42%'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Capacity</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Broadcasts */}
          <div className="space-y-8">
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Global Broadcast</h2>
              </div>

              {/* Compose Alert */}
              <form onSubmit={handleSendAlert} className="mb-8 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Alert Type</label>
                  <div className="flex gap-2">
                    {(['info', 'warning', 'critical'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAlertType(type)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                          newAlertType === type 
                            ? type === 'info' ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                              : type === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                              : 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Message</label>
                  <textarea 
                    value={newAlertMsg}
                    onChange={(e) => setNewAlertMsg(e.target.value)}
                    placeholder="Enter message to broadcast to all attendees..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none h-24"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newAlertMsg.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </button>
              </form>

              {/* Alert History */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Active Alerts</h3>
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={alert.id} 
                      className={`p-4 rounded-xl border ${
                        alert.type === 'info' ? 'bg-blue-500/10 border-blue-500/20' :
                        alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                        'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {alert.type === 'info' && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />}
                        {alert.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
                        <div>
                          <p className={`text-sm font-medium ${
                            alert.type === 'info' ? 'text-blue-100' :
                            alert.type === 'warning' ? 'text-yellow-100' :
                            'text-red-100'
                          }`}>
                            {alert.message}
                          </p>
                          <span className="text-xs opacity-60 mt-1 block">{alert.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
