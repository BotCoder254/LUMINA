import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiHeart, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { BlogGrid } from '../components/blog/BlogGrid';

const MotionBox = motion(Box);

export const Favorites = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();

    // Set up real-time subscription
    const favoritesSubscription = supabase
      .channel('favorites_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(favoritesSubscription);
    };
  }, [user.id]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`
          post_id,
          posts (
            *,
            author:author(
              email,
              id,
              raw_user_meta_data
            )
          )
        `)
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      // Extract posts from favorites data
      const posts = favoritesData
        .map(favorite => favorite.posts)
        .filter(post => post !== null);

      setFavorites(posts);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error fetching favorites',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (postId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;

      setFavorites(favorites.filter(post => post.id !== postId));
      toast({
        title: 'Removed from favorites',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error removing from favorites',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          <Box>
            <HStack spacing={3} mb={2}>
              <Icon as={FiHeart} color="red.500" boxSize={6} />
              <Heading size="lg">Favorite Posts</Heading>
            </HStack>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Your collection of favorite posts
            </Text>
          </Box>

          {error ? (
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Error Loading Favorites
              </AlertTitle>
              <AlertDescription maxWidth="sm" mb={4}>
                {error}
              </AlertDescription>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={fetchFavorites}
                colorScheme="red"
                variant="outline"
              >
                Try Again
              </Button>
            </Alert>
          ) : favorites.length === 0 && !loading ? (
            <Alert
              status="info"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                No Favorites Yet
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Start adding posts to your favorites by clicking the heart icon on any post.
              </AlertDescription>
            </Alert>
          ) : (
            <BlogGrid
              posts={favorites}
              loading={loading}
              onRemoveFromFavorites={handleRemoveFromFavorites}
              showFavoriteButton
            />
          )}
        </VStack>
      </MotionBox>
    </Container>
  );
}; 