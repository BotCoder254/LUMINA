import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  useToast,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiBookOpen,
  FiEdit3,
  FiFilter,
  FiClock,
  FiHeart,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { BlogGrid } from '../components/blog/BlogGrid';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import blogAnimation from '../assets/animations/blog-animation.json';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { Footer } from '../components/layout/Footer';

const MotionBox = motion(Box);

const StatCard = ({ icon, label, value }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Box bg={cardBg} p={6} borderRadius="lg" shadow="md">
      <VStack spacing={4}>
        <Icon as={icon} boxSize={6} color="brand.500" />
        <Text fontSize="3xl" fontWeight="bold" color="brand.500">
          {value}
        </Text>
        <Text color={textColor} fontSize="sm" textAlign="center">
          {label}
        </Text>
      </VStack>
    </Box>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={cardBg} p={6} borderRadius="lg" shadow="md">
      <VStack align="start" spacing={4}>
        <Icon as={icon} boxSize={6} color="brand.500" />
        <Text fontSize="lg" fontWeight="bold">
          {title}
        </Text>
        <Text color={textColor}>
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [category, setCategory] = useState('all');

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const heroBg = useColorModeValue('brand.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headingSize = useBreakpointValue({ base: "2xl", md: "3xl", lg: "4xl" });

  useEffect(() => {
    fetchPosts();
  }, [sortBy, category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author(username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('status', 'published');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      switch (sortBy) {
        case 'popular':
          query = query.order('likes.count', { ascending: false });
          break;
        case 'comments':
          query = query.order('comments.count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching posts',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const LandingSection = () => (
    <Box minH="100vh" display="flex" flexDirection="column">
      <LandingNavbar />
      
      <Box flex="1">
        <Box
          bg={heroBg}
          pt={{ base: 32, md: 40 }}
          pb={{ base: 20, md: 28 }}
          position="relative"
          overflow="hidden"
        >
          <Container maxW="container.xl">
            <Stack
              direction={{ base: 'column', lg: 'row' }}
              spacing={{ base: 10, lg: 20 }}
              align="center"
              justify="space-between"
            >
              <VStack
                spacing={6}
                align={{ base: 'center', lg: 'start' }}
                textAlign={{ base: 'center', lg: 'left' }}
                maxW="600px"
              >
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heading
                    as="h1"
                    size={headingSize}
                    bgGradient="linear(to-r, brand.400, brand.600)"
                    bgClip="text"
                    lineHeight="shorter"
                  >
                    Share Your Stories with the World
                  </Heading>
                </MotionBox>
                
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Text fontSize={{ base: 'lg', md: 'xl' }} color={textColor}>
                    Join our community of writers and readers. Create, share, and discover amazing stories.
                  </Text>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <HStack spacing={4}>
                    <Button
                      size="lg"
                      colorScheme="brand"
                      leftIcon={<Icon as={FiEdit3} />}
                      onClick={() => navigate('/signup')}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                    >
                      Start Writing
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      leftIcon={<Icon as={FiUsers} />}
                      onClick={() => navigate('/signin')}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                    >
                      Join Community
                    </Button>
                  </HStack>
                </MotionBox>
              </VStack>

              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                maxW="500px"
                w="full"
                display={{ base: 'none', lg: 'block' }}
              >
                <Lottie animationData={blogAnimation} loop={true} />
              </MotionBox>
            </Stack>
          </Container>

          <Box
            position="absolute"
            top="50%"
            left="0"
            right="0"
            bottom="0"
            bg={bgColor}
            transform="skewY(-3deg)"
            transformOrigin="top right"
            zIndex={-1}
          />
        </Box>

        <Box py={20} bg={bgColor}>
          <Container maxW="container.xl">
            <VStack spacing={16}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
                <StatCard icon={FiUsers} label="Active Writers" value="10K+" />
                <StatCard icon={FiBookOpen} label="Stories Published" value="50K+" />
                <StatCard icon={FiHeart} label="Monthly Readers" value="1M+" />
                <StatCard icon={FiClock} label="Avg. Daily Posts" value="1K+" />
              </SimpleGrid>

              <VStack spacing={12} w="full">
                <Heading
                  textAlign="center"
                  size="xl"
                  bgGradient="linear(to-r, brand.400, brand.600)"
                  bgClip="text"
                >
                  Why Choose Lumina?
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                  <FeatureCard
                    icon={FiEdit3}
                    title="Easy Writing"
                    description="Intuitive editor with markdown support and real-time preview."
                  />
                  <FeatureCard
                    icon={FiTrendingUp}
                    title="Grow Your Audience"
                    description="Connect with readers interested in your unique perspective."
                  />
                  <FeatureCard
                    icon={FiUsers}
                    title="Vibrant Community"
                    description="Engage with other writers and readers through comments and likes."
                  />
                </SimpleGrid>
              </VStack>
            </VStack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );

  const BlogSection = () => (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} width="100%">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            w="full"
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
          >
            <InputGroup maxW={{ base: 'full', md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                borderRadius="lg"
              />
            </InputGroup>
            
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                bg={cardBg}
                borderRadius="lg"
                w={{ base: 'full', sm: '200px' }}
                icon={<FiFilter />}
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="comments">Most Commented</option>
              </Select>
              
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                bg={cardBg}
                borderRadius="lg"
                w={{ base: 'full', sm: '200px' }}
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="health">Health</option>
              </Select>
            </Stack>
          </Stack>

          <BlogGrid
            posts={filteredPosts}
            loading={loading}
            showOwnerActions={false}
          />
        </VStack>
      </Container>
    </Box>
  );

  return user ? <BlogSection /> : <LandingSection />;
};