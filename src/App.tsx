/**
 * Mailora AI - Autonomous Gmail Autoresponder
 * Clean, focused setup: Google Workspace connection & Knowledge upload hub.
 * Auto-replies directly from user's Gmail in the background.
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Dashboard } from './components/dashboard/Dashboard';
import { AppLayout } from './components/layout/AppLayout';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainViewRouter: React.FC = () => {
  const { currentView } = useApp();

  if (currentView === 'landing') {
    return <LandingPage />;
  }

  if (currentView === 'onboarding') {
    return <OnboardingWizard />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainViewRouter />
      <AuthModal />
      <ToastContainer />
    </AppProvider>
  );
}
