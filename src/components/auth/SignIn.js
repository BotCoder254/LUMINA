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
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Flex,
  Divider,
  HStack,
  Center,
  Icon,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiGithub, FiMail } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/animations/login-animation.json';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({
        title: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
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
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <MotionContainer
        maxW="6xl"
        p={{ base: 5, md: 10 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
          {/* Left side - Animation */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            flex={1}
            display={{ base: 'none', md: 'block' }}
          >
            <Lottie animationData={loginAnimation} loop={true} />
          </MotionBox>

          {/* Right side - Login Form */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            flex={1}
            p={8}
            bg={bgColor}
            boxShadow="xl"
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            maxW="md"
            w="100%"
          >
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} align="center">
                <Heading
                  color={useColorModeValue('brand.500', 'brand.200')}
                  fontSize="3xl"
                  fontWeight="bold"
                >
                  Welcome Back
                </Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')} align="center">
                  Sign in to continue to Lumina
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        size="lg"
                        borderRadius="lg"
                      />
                      <InputRightElement h="full">
                        <Icon as={FiMail} color="gray.400" />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        size="lg"
                        borderRadius="lg"
                      />
                      <InputRightElement h="full">
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="100%"
                    isLoading={loading}
                    loadingText="Signing in..."
                    borderRadius="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>

              <Link
                color="brand.500"
                href="/reset-password"
                textAlign="center"
                fontWeight="medium"
                fontSize="sm"
              >
                Forgot Password?
              </Link>

              <HStack>
                <Divider />
                <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
                  or continue with
                </Text>
                <Divider />
              </HStack>

              <HStack spacing={4}>
                <Button
                  w="full"
                  variant="outline"
                  leftIcon={<FcGoogle />}
                  onClick={() => {/* Implement Google Sign In */}}
                >
                  Google
                </Button>
                <Button
                  w="full"
                  variant="outline"
                  leftIcon={<FiGithub />}
                  onClick={() => {/* Implement GitHub Sign In */}}
                >
                  GitHub
                </Button>
              </HStack>

              <Center>
                <Text fontSize="sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    color="brand.500"
                    href="/signup"
                    fontWeight="semibold"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Sign Up
                  </Link>
                </Text>
              </Center>
            </VStack>
          </MotionBox>
        </Flex>
      </MotionContainer>
    </Flex>
  );
}; 