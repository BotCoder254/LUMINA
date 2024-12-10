import React, { useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { theme } from './theme';
import { resetDatabase } from './lib/database';
import { LoadingScreen } from './components/common/LoadingScreen';
import { supabase } from './lib/supabaseClient';

export const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;

        // Initialize database if needed
        if (session?.user?.role === 'service_role') {
          const { error: dbError } = await resetDatabase();
          if (dbError) throw new Error(dbError);
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitError(error.message);
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <ChakraProvider theme={theme}>
        <LoadingScreen message="Initializing application..." />
      </ChakraProvider>
    );
  }

  if (initError) {
    return (
      <ChakraProvider theme={theme}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Initialization Error</h1>
          <p>Failed to initialize the application. Please try again later.</p>
          <p style={{ color: 'red' }}>{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4299E1',
              color: 'white',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};
