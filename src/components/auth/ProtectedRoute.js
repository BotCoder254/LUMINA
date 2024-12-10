import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};