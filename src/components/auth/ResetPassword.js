import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Container,
  Heading,
  Link,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

export const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await resetPassword(email);
      if (error) throw error;
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for further instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Reset Password</Heading>
        <Box w="100%" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={loading}
              >
                Send Reset Link
              </Button>
            </VStack>
          </form>
          <Text mt={4} textAlign="center">
            Remember your password?{' '}
            <Link color="blue.500" href="/signin">
              Sign In
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}; 