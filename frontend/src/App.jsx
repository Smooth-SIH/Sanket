import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from './components/common/Navbar';
import { AlertBannerTicker } from './components/common/AlertBannerTicker';

import { HeroSection } from './components/landing/HeroSection';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { HowItWorks } from './components/landing/HowItWorks';
import { LivePreview } from './components/landing/LivePreview';
import { StatsCounter } from './components/landing/StatsCounter';
import { TrustSection } from './components/landing/TrustSection';
import { CallToAction } from './components/landing/CallToAction';
import { Footer } from './components/landing/Footer';

import { DashboardView } from './components/dashboard/DashboardView';
import { MapView } from './components/map/MapView';
import { AlertCenterView } from './components/alerts/AlertCenterView';
import { AssetManagementView } from './components/assets/AssetManagementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';

import { initSocket } from './services/api';
import { setLatestScan, setLiveConnected } from './store/slices/satelliteSlice';
import { addAlert } from './store/slices/alertSlice';
import { setCurrentView, getInitialViewFromUrl } from './store/slices/authSlice';

export default function App() {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.auth.currentView);
  const alerts = useSelector((state) => state.alerts.alerts);

  const activeCriticalAlert = alerts.find(a => a.severity === 'CRITICAL' && !a.acknowledged);

  useEffect(() => {
    // Synchronize browser back/forward buttons with current view
    const handlePopState = () => {
      dispatch(setCurrentView(getInitialViewFromUrl()));
    };
    window.addEventListener('popstate', handlePopState);

    // Initialize WebSockets Telemetry Listener
    initSocket(
      (scanData) => {
        dispatch(setLatestScan(scanData));
      },
      (criticalAlert) => {
        dispatch(addAlert(criticalAlert));
      },
      (isConnected) => {
        dispatch(setLiveConnected(isConnected));
      }
    );

    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter antialiased flex flex-col selection:bg-blue-700 selection:text-white">
      {/* Official Government Emergency Advisory Ticker */}
      <AlertBannerTicker activeAlert={activeCriticalAlert} />
      
      {/* Official National Portal Navigation Bar */}
      <Navbar />

      {/* Main Content View */}
      <main className="flex-1">
        {isLanding ? (
          /* Separate Official Landing Page */
          <div className="w-full">
            <HeroSection />
            <FeaturesGrid />
            <HowItWorks />
            <LivePreview />
            <StatsCounter />
            <TrustSection />
            <CallToAction />
            <Footer />
          </div>
        ) : (
          /* Operational Console (Dashboard, Map, Alerts, Assets, Analytics) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'map' && <MapView />}
            {currentView === 'alerts' && <AlertCenterView />}
            {currentView === 'assets' && <AssetManagementView />}
            {currentView === 'analytics' && <AnalyticsView />}
          </div>
        )}
      </main>

      {/* Official Footer only inside the App (Landing has its own footer) */}
      {!isLanding && (
        <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 SANKET — Ministry of Earth Sciences, ISRO MOSDAC & NDMA. All rights reserved.</p>
            <div className="flex items-center space-x-4 text-slate-400">
              <span>National Disaster Helpline: <strong className="text-white">1070 / 1078</strong></span>
              <span>•</span>
              <span>Operational Build: <strong className="text-white">v2.4-GovOps</strong></span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
