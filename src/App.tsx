import React from 'react';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { user, loading, isAuthReady } = useFirebase();

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="w-12 h-12 border-4 border-[#8a2be2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
