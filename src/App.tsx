import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Users, AlertCircle, ChevronLeft, Search, Menu, Clock, ArrowRight, ExternalLink, Shield, AlertTriangle, X } from 'lucide-react';
import StadiumMap from './components/StadiumMap';
import TicketEntry, { TicketData } from './components/TicketEntry';
import IndoorNavigation from './components/IndoorNavigation';
import StaffDashboard from './components/StaffDashboard';
import Recommendations from './components/Recommendations';
import SmartGuide from './components/SmartGuide';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'routing' | 'navigation' | 'staff'>('landing');
  const [ticket, setTicket] = useState<TicketData | null>(null);
  
  // Menu and Search State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock global alert state
  const [activeAlert, setActiveAlert] = useState<{message: string, type: 'warning' | 'info' | 'critical'} | null>({
    message: "South Stand concessions experiencing high volume. Please use East Wing.",
    type: "warning"
  });

  const handleTicketSubmit = (ticketData: TicketData) => {
    setTicket(ticketData);
    setActiveView('routing');
  };

  const handleBack = () => {
    setActiveView('landing');
    setTicket(null);
  };

  const startNavigation = () => {
    setActiveView('navigation');
  };

  const endNavigation = () => {
    setActiveView('routing');
  };

  const toggleStaffDashboard = () => {
    if (activeView === 'staff') {
      setActiveView('landing');
    } else {
      setActiveView('staff');
    }
  };

  // Mock routing logic based on stand
  const getRouteInfo = (stand: string) => {
    const s = stand.toLowerCase();
    if (s === 'north') return { gate: 'Gate N', wait: '5 mins', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (s === 'south') return { gate: 'Gate S', wait: '12 mins', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (s === 'east') return { gate: 'Gate E', wait: '2 mins', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (s === 'west') return { gate: 'Gate W', wait: '8 mins', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { gate: 'Main Gate', wait: '10 mins', color: 'text-slate-400', bg: 'bg-slate-500/10' };
  };

  const routeInfo = ticket ? getRouteInfo(ticket.stand) : null;

  const openGoogleMaps = () => {
    if (!routeInfo) return;
    const destination = encodeURIComponent(`Wembley Stadium ${routeInfo.gate}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank', 'noopener,noreferrer');
  };

  if (activeView === 'staff') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 relative">
        <button 
          onClick={toggleStaffDashboard}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-50 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Attendee App
        </button>
        <StaffDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeView === 'routing' ? (
              <button 
                onClick={handleBack}
                aria-label="Go back"
                className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-slate-300" />
              </button>
            ) : (
              <button 
                onClick={() => setIsMenuOpen(true)}
                aria-label="Menu" 
                className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-300" />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                VenueFlow
              </h1>
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                Wembley Stadium
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleStaffDashboard}
              aria-label="Staff Dashboard"
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
              title="Staff Dashboard"
            >
              <Shield className="w-5 h-5 text-indigo-400" />
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search" 
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-slate-900 border-r border-slate-800 z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">VenueFlow</h2>
                  <span className="text-xs text-slate-400 font-medium tracking-wide">Wembley Stadium</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {['My Tickets', 'Stadium Map', 'Food & Beverage', 'Merchandise', 'Accessibility', 'Help & Support'].map((item) => (
                  <button 
                    key={item} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-left py-3 px-4 rounded-xl hover:bg-slate-800 text-slate-200 font-medium transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-slate-800">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleStaffDashboard();
                  }}
                  className="w-full flex items-center gap-3 text-left py-3 px-4 rounded-xl hover:bg-slate-800 text-indigo-400 font-medium transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Staff Login
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col"
          >
            <div className="max-w-md mx-auto w-full p-4 flex items-center gap-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search for gates, food, restrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500"
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} 
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="max-w-md mx-auto w-full p-4">
              {searchQuery.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 font-medium px-2">Results for "{searchQuery}"</p>
                  {['North Gate', 'Burger Stand (Level 1)', 'Restrooms (East Wing)', 'Merchandise Shop', 'First Aid (South)', 'Gate S'].filter(i => i.toLowerCase().includes(searchQuery.toLowerCase())).map((item, i) => (
                    <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                        <span className="text-slate-200 font-medium">{item}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {['North Gate', 'Burger Stand (Level 1)', 'Restrooms (East Wing)', 'Merchandise Shop', 'First Aid (South)', 'Gate S'].filter(i => i.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-slate-400 text-center py-8">No results found.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 font-medium px-2">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Restrooms', 'Hot Dogs', 'Gate N', 'First Aid', 'Merch'].map((tag) => (
                      <button 
                        key={tag} 
                        onClick={() => setSearchQuery(tag)} 
                        className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Alert Banner */}
      <AnimatePresence>
        {activeAlert && activeView !== 'navigation' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`overflow-hidden ${
              activeAlert.type === 'warning' ? 'bg-yellow-500/20 border-b border-yellow-500/30' : 
              activeAlert.type === 'critical' ? 'bg-red-500/20 border-b border-red-500/30' : 
              'bg-blue-500/20 border-b border-blue-500/30'
            }`}
          >
            <div className="max-w-md mx-auto px-4 py-3 flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                activeAlert.type === 'warning' ? 'text-yellow-400' : 
                activeAlert.type === 'critical' ? 'text-red-400' : 
                'text-blue-400'
              }`} />
              <p className={`text-sm font-medium flex-1 ${
                activeAlert.type === 'warning' ? 'text-yellow-100' : 
                activeAlert.type === 'critical' ? 'text-red-100' : 
                'text-blue-100'
              }`}>
                {activeAlert.message}
              </p>
              <button 
                onClick={() => setActiveAlert(null)} 
                aria-label="Dismiss alert"
                className="opacity-60 hover:opacity-100 transition-opacity p-1 -mr-1"
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto relative pb-24">
        <AnimatePresence mode="wait">
          {activeView === 'landing' && (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TicketEntry onTicketSubmit={handleTicketSubmit} />
            </motion.div>
          )}

          {activeView === 'routing' && (
            <motion.div
              key="routing-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className="px-4 py-6">
                <h2 className="text-2xl font-bold mb-1">Your Route</h2>
                <p className="text-slate-400 text-sm">
                  Seat: {ticket?.stand} Stand, Row {ticket?.row}, Seat {ticket?.seat}
                </p>
              </div>
              
              <StadiumMap highlightStand={ticket?.stand} />

              {/* Routing Instructions Panel */}
              <div className="px-4 mt-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-indigo-400" />
                      Recommended Path
                    </h3>
                    {routeInfo && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${routeInfo.bg}`}>
                        <Clock className={`w-3.5 h-3.5 ${routeInfo.color}`} />
                        <span className={`text-xs font-bold ${routeInfo.color}`}>{routeInfo.wait} wait</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-slate-800">
                    
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-[30px] w-5 h-5 rounded-full bg-indigo-500 border-4 border-slate-900 flex items-center justify-center z-10"></div>
                      <p className="font-semibold text-slate-200">Enter via {routeInfo?.gate}</p>
                      <p className="text-sm text-slate-500 mt-1">Scan your ticket at the turnstiles.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-[30px] w-5 h-5 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center z-10"></div>
                      <p className="font-semibold text-slate-200">Take Concourse Level 1</p>
                      <p className="text-sm text-slate-500 mt-1">Follow the blue signs towards the {ticket?.stand} Stand.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-[30px] w-5 h-5 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center z-10"></div>
                      <p className="font-semibold text-slate-200">Proceed to Row {ticket?.row}</p>
                      <p className="text-sm text-slate-500 mt-1">Your seat ({ticket?.seat}) will be on the left side of the aisle.</p>
                    </div>

                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button 
                      onClick={openGoogleMaps}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Navigate to {routeInfo?.gate} via Google Maps
                      <ExternalLink className="w-4 h-4 text-slate-400 ml-1" />
                    </button>
                    
                    <button 
                      onClick={startNavigation}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Start Indoor Navigation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Personalized Recommendations */}
              {ticket && <Recommendations stand={ticket.stand} />}
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Navigation Overlay */}
        <AnimatePresence>
          {activeView === 'navigation' && ticket && (
            <motion.div
              key="navigation-overlay"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50"
            >
              <IndoorNavigation ticket={ticket} onExit={endNavigation} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating AI Assistant */}
      <SmartGuide />
    </div>
  );
}
