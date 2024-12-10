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
  FormErrorMessage,
  Icon,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiGithub, FiMail, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import signupAnimation from '../../assets/animations/signup-animation.json';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    try {
      setLoading(true);
      const { error } = await signUp(email, password);
      if (error) throw error;
      toast({
        title: 'Account created.',
        description: 'Please check your email for verification.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/signin');
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
            <Lottie animationData={signupAnimation} loop={true} />
          </MotionBox>

          {/* Right side - Sign Up Form */}
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
                  Create Account
                </Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')} align="center">
                  Join the Lumina community
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <InputGroup>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        size="lg"
                        borderRadius="lg"
                      />
                      <InputRightElement h="full">
                        <Icon as={FiUser} color="gray.400" />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

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
                        placeholder="Create a password"
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

                  <FormControl isRequired isInvalid={password !== confirmPassword}>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        size="lg"
                        borderRadius="lg"
                      />
                      <InputRightElement h="full">
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>Passwords do not match</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="100%"
                    isLoading={loading}
                    loadingText="Creating account..."
                    borderRadius="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                  >
                    Sign Up
                  </Button>
                </VStack>
              </form>

              <HStack>
                <Divider />
                <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
                  or sign up with
                </Text>
                <Divider />
              </HStack>

              <HStack spacing={4}>
                <Button
                  w="full"
                  variant="outline"
                  leftIcon={<FcGoogle />}
                  onClick={() => {/* Implement Google Sign Up */}}
                >
                  Google
                </Button>
                <Button
                  w="full"
                  variant="outline"
                  leftIcon={<FiGithub />}
                  onClick={() => {/* Implement GitHub Sign Up */}}
                >
                  GitHub
                </Button>
              </HStack>

              <Center>
                <Text fontSize="sm">
                  Already have an account?{' '}
                  <Link
                    color="brand.500"
                    href="/signin"
                    fontWeight="semibold"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Sign In
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