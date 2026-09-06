import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from './components/common/Navbar';
import { ParticleBackground } from './components/common/ParticleBackground';
import { AlertBannerTicker } from './components/common/AlertBannerTicker';

import { HeroSection } from './components/landing/HeroSection';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { HowItWorks } from './components/landing/HowItWorks';
import { LivePreview } from './components/landing/LivePreview';
import { TechStackBadges } from './components/landing/TechStackBadges';
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

export default function App() {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.auth.currentView);
  const alerts = useSelector((state) => state.alerts.alerts);

  const activeCriticalAlert = alerts.find(a => a.severity === 'CRITICAL' && !a.acknowledged);

  useEffect(() => {
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
  }, [dispatch]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'map':
        return <MapView />;
      case 'alerts':
        return <AlertCenterView />;
      case 'assets':
        return <AssetManagementView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'landing':
      default:
        return (
          <>
            <HeroSection />
            <FeaturesGrid />
            <HowItWorks />
            <LivePreview />
            <TechStackBadges />
            <StatsCounter />
            <TrustSection />
            <CallToAction />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050c17] text-slate-100 font-inter relative selection:bg-cyan-500 selection:text-black">
      <ParticleBackground />
      <AlertBannerTicker activeAlert={activeCriticalAlert} />
      <Navbar />

      <main className="relative z-10">
        {renderView()}
      </main>
    </div>
  );
}
