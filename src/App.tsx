import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Users, AlertCircle, ChevronLeft, Search, Menu, Clock, ArrowRight, ExternalLink, Shield, AlertTriangle, X, Coffee, ShoppingBag, Accessibility as AccessibilityIcon, ShieldAlert, PhoneCall, HeartPulse, LogIn } from 'lucide-react';
import StadiumMap from './components/StadiumMap';
import TicketEntry, { TicketData } from './components/TicketEntry';
import IndoorNavigation from './components/IndoorNavigation';
import StaffDashboard from './components/StaffDashboard';
import Recommendations from './components/Recommendations';
import SmartGuide from './components/SmartGuide';

// Firebase
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'routing' | 'navigation' | 'staff' | 'food' | 'merch' | 'accessibility'>('landing');
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Menu and Search State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false); // SOS State
  const [activeEmergency, setActiveEmergency] = useState<{ id: string; type: 'Medical' | 'Security'; eta: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeEmergency?.id) return;
    
    // Listen to the specific alert to see if Staff dismissed it in Firebase
    const unsubscribe = onSnapshot(doc(db, 'alerts', activeEmergency.id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === 'Resolved' && data.eta !== 'Cancelled by User') {
          // A staff member resolved it remotely!
          setActiveEmergency(null);
          // Optional: Add a toast notification here if desired
        }
      }
    });
    
    return () => unsubscribe();
  }, [activeEmergency?.id]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const dispatchSOS = async (type: 'Medical' | 'Security', eta: string) => {
    if (!user) {
      alert("Please login first to dispatch an emergency alert.");
      handleLogin();
      return;
    }

    try {
      const alertId = Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6);
      
      const newAlert = {
        id: alertId,
        type: type,
        status: 'Active',
        userId: user.uid,
        createdAt: serverTimestamp(),
        stand: ticket?.stand || 'Unknown',
        row: ticket?.row || 'Unknown',
        column: ticket?.column || 'Unknown',
        seat: ticket?.seat || 'Unknown',
        eta: eta
      };

      await setDoc(doc(db, 'alerts', alertId), newAlert);
      
      setIsSOSOpen(false);
      setActiveEmergency({ id: alertId, type, eta });
    } catch (error: any) {
      console.error("Firebase SOS Error:", error);
      alert("Failed to connect to the emergency dispatch system. " + error.message);
    }
  };

  const cancelSOS = async () => {
    if (!activeEmergency || !user) return;
    try {
      await setDoc(doc(db, 'alerts', activeEmergency.id), {
        status: 'Resolved',
        eta: 'Cancelled by User',
        updatedAt: serverTimestamp()
      }, { merge: true });
      setActiveEmergency(null);
    } catch (err: any) {
      console.error("Firebase Cancel SOS Error:", err);
      // For demo, forcefully dismiss even if network fails
      setActiveEmergency(null);
    }
  };

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

  const handleMenuClick = (item: string) => {
    setIsMenuOpen(false);
    switch (item) {
      case 'My Tickets':
        setActiveView(ticket ? 'routing' : 'landing');
        break;
      case 'Stadium Map':
        setActiveView('routing');
        break;
      case 'Food & Beverage':
        setActiveView('food');
        break;
      case 'Merchandise':
        setActiveView('merch');
        break;
      case 'Accessibility':
        setActiveView('accessibility');
        break;
      case 'Help & Support':
        window.dispatchEvent(new CustomEvent('open-smart-guide'));
        break;
    }
  };

  // Helper generic component for the new views
  const FeatureView = ({ title, icon: Icon, items }: { title: string, icon: any, items: any[] }) => (
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
      <button 
        onClick={handleBack}
        className="w-full mt-8 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-colors"
      >
        Go Back
      </button>
    </motion.div>
  );

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
              onClick={() => setIsSOSOpen(true)}
              aria-label="Emergency SOS"
              className="p-2 hover:bg-rose-500/20 rounded-full transition-colors group relative"
              title="Emergency SOS"
            >
              <ShieldAlert className="w-5 h-5 text-rose-500 group-hover:text-rose-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
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
                    onClick={() => handleMenuClick(item)}
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
                  Seat: {ticket?.stand || 'Not assigned'} Stand, Row {ticket?.row || '-'}, Seat {ticket?.seat || '-'}
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
                      <p className="font-semibold text-slate-200">Enter via {routeInfo?.gate || 'Main Gate'}</p>
                      <p className="text-sm text-slate-500 mt-1">Scan your ticket at the turnstiles.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-[30px] w-5 h-5 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center z-10"></div>
                      <p className="font-semibold text-slate-200">Take Concourse Level 1</p>
                      <p className="text-sm text-slate-500 mt-1">Follow the blue signs towards the {ticket?.stand || 'Main'} Stand.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-[30px] w-5 h-5 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center z-10"></div>
                      <p className="font-semibold text-slate-200">Proceed to Row {ticket?.row || '-'}</p>
                      <p className="text-sm text-slate-500 mt-1">Your seat ({ticket?.seat || '-'}) will be on the left side of the aisle.</p>
                    </div>

                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button 
                      onClick={openGoogleMaps}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Navigate via Google Maps
                      <ExternalLink className="w-4 h-4 text-slate-400 ml-1" />
                    </button>
                    
                    {ticket && (
                      <button 
                        onClick={startNavigation}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        Start Indoor Navigation
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personalized Recommendations */}
              {ticket && <Recommendations stand={ticket.stand} />}
              
            </motion.div>
          )}

          {activeView === 'food' && (
            <FeatureView 
              key="food-view"
              title="Food & Beverage" 
              icon={Coffee} 
              items={[
                { name: 'The Wembley Burger', location: 'Level 1, North Stand', status: 'Open' },
                { name: 'Vegan Corner', location: 'Level 2, East Stand', status: 'Open' },
                { name: 'Taphouse Bar', location: 'Level 1, South Stand', status: 'Busy' }
              ]} 
            />
          )}

          {activeView === 'merch' && (
            <FeatureView 
              key="merch-view"
              title="Merchandise" 
              icon={ShoppingBag} 
              items={[
                { name: 'Main Stadium Store', location: 'Level 1, Olympic Way', status: 'Open' },
                { name: 'Matchday Kiosk North', location: 'North Stand Concourse', status: 'Open' },
                { name: 'Exclusive Authentics', location: 'Level 2, West Area', status: 'Closed' }
              ]} 
            />
          )}

          {activeView === 'accessibility' && (
            <FeatureView 
              key="accessibility-view"
              title="Accessibility" 
              icon={AccessibilityIcon} 
              items={[
                { name: 'Sensory Room', location: 'Level 2, West Stand', status: 'Available' },
                { name: 'Wheelchair Platform', location: 'All Stands, Row 10', status: 'Open' },
                { name: 'Accessible Restrooms', location: 'Every Concourse Sector', status: 'Open' }
              ]} 
            />
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

      {/* Emergency SOS Modal */}
      <AnimatePresence>
        {isSOSOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-end md:justify-center p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-3xl shadow-[0_0_50px_rgba(225,29,72,0.3)] overflow-hidden"
            >
              <div className="bg-rose-500 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Emergency Assistance</h2>
                <p className="text-rose-100 text-sm mt-2">
                  If this is a life-threatening emergency, please call local authorities (999/911) immediately.
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-slate-300 text-sm font-medium text-center mb-6">
                  Select an option below to instantly share your location ({ticket?.stand || 'Unknown'} area) with venue staff.
                </p>

                <button 
                  onClick={() => dispatchSOS('Medical', '2 mins')}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:bg-rose-500/20 transition-colors">
                    <HeartPulse className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-100 text-lg">Medical Help</h3>
                    <p className="text-sm text-slate-400">Request a first aid responder</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                </button>

                <button 
                  onClick={() => dispatchSOS('Security', '3 mins')}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-100 text-lg">Venue Security</h3>
                    <p className="text-sm text-slate-400">Report an incident or hazard</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </button>

                <button 
                  onClick={() => setIsSOSOpen(false)}
                  className="w-full mt-4 p-4 rounded-2xl text-slate-400 font-bold hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel / Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Active Tracking View */}
      <AnimatePresence>
        {activeEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[80] bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative flex items-center justify-center mb-10 mt-8">
              {/* Radar Pulsing Rings */}
              <motion.div
                animate={{ scale: [1, 1.8, 2.5], opacity: [0.6, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className={`absolute w-32 h-32 rounded-full ${activeEmergency.type === 'Medical' ? 'bg-rose-500' : 'bg-blue-500'}`}
              />
              <motion.div
                animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeOut" }}
                className={`absolute w-32 h-32 rounded-full ${activeEmergency.type === 'Medical' ? 'bg-rose-500' : 'bg-blue-500'}`}
              />
              <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 ${activeEmergency.type === 'Medical' ? 'bg-rose-500' : 'bg-blue-600'} shadow-2xl shadow-${activeEmergency.type === 'Medical' ? 'rose' : 'blue'}-500/50`}>
                {activeEmergency.type === 'Medical' ? <HeartPulse className="w-16 h-16 text-white" /> : <Shield className="w-16 h-16 text-white" />}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              {activeEmergency.type} Help Dispatched
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-sm">
              Remain at your current location ({ticket?.stand ? `${ticket.stand} Stand, Row ${ticket.row}` : 'Stadium grounds'}). Responders are tracking your device.
            </p>

            <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-3xl w-full max-w-sm mb-10 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 font-medium">Estimated Arrival</span>
                <span className={`font-bold text-2xl ${activeEmergency.type === 'Medical' ? 'text-rose-400' : 'text-blue-400'}`}>
                  {activeEmergency.eta}
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   // Mock progress bar showing them arriving over a minute to look realistic 
                   transition={{ duration: 60, ease: "linear" }} 
                   className={`h-full ${activeEmergency.type === 'Medical' ? 'bg-rose-500' : 'bg-blue-500'}`}
                 />
              </div>
              <div className="text-sm text-slate-500 mt-5 font-medium flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Responder: {activeEmergency.type === 'Medical' ? 'Medic Team Alpha' : 'Security Unit 4'}
              </div>
            </div>

            <button
              onClick={cancelSOS}
              className="w-full max-w-sm py-4 border-2 border-slate-800 text-slate-400 font-bold rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-colors"
            >
              Cancel Request
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
