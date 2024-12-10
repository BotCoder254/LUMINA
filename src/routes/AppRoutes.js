import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { SignIn } from '../components/auth/SignIn';
import { SignUp } from '../components/auth/SignUp';
import { ResetPassword } from '../components/auth/ResetPassword';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Sidebar } from '../components/layout/Sidebar';
import { Home } from '../pages/Home';
import { Profile } from '../pages/Profile';
import { CreatePost } from '../pages/CreatePost';
import { MyPosts } from '../pages/MyPosts';
import { Settings } from '../pages/Settings';
import { Favorites } from '../pages/Favorites';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box minH="100vh" position="relative">
      <Box bg={bgColor} minH="100vh">
        {user && <Sidebar />}
        <Box 
          ml={user ? { base: 0, md: 60 } : 0} 
          p={{ base: 4, md: 8 }}
          transition="margin 0.3s"
        >
          <Box pt={{ base: 16, md: 4 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route
        path="/signin"
        element={
          user ? <Navigate to="/" /> : (
            <MainLayout>
              <SignIn />
            </MainLayout>
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? <Navigate to="/" /> : (
            <MainLayout>
              <SignUp />
            </MainLayout>
          )
        }
      />
      <Route
        path="/reset-password"
        element={
          user ? <Navigate to="/" /> : (
            <MainLayout>
              <ResetPassword />
            </MainLayout>
          )
        }
      />

      {/* Home Route (Landing Page) */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreatePost />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-posts"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyPosts />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Favorites />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 