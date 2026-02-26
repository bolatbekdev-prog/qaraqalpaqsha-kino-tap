
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLoader from './AppLoader.tsx';
import { AuthProvider } from './AuthProvider';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <AppLoader />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}