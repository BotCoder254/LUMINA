import {
  Box,
  SimpleGrid,
  Image,
  Text,
  VStack,
  useColorModeValue,
  Heading,
  Skeleton,
  AspectRatio,
  Tag,
  HStack,
  Icon,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiHeart, 
  FiEye, 
  FiShare2, 
  FiBookmark,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const PostCard = ({ post, index, onDelete, isOwner, showFavoriteButton, onRemoveFromFavorites }) => {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      checkFavoriteStatus();
    }
  }, [user, post.id]);

  const checkLikeStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('liked')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsLiked(data?.liked || false);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      setLikeCount(prev => newLikeStatus ? prev + 1 : prev - 1);

      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: post.id,
          user_id: user.id,
          liked: newLikeStatus,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating like:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      toast({
        title: 'Error updating like',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to favorite posts',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsFavorite(false);
        if (onRemoveFromFavorites) {
          onRemoveFromFavorites(post.id);
        }
        toast({
          title: 'Removed from favorites',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: 'Error updating favorite',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/post/${post.id}`,
      });
    } catch (error) {
      // Fallback to copying link
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast({
        title: 'Link copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      as="article"
      bg={bgColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-8px)',
        shadow: 'lg',
        borderColor: 'brand.500',
        transition: 'all 0.2s ease-in-out',
      }}
      cursor="pointer"
      onClick={() => navigate(`/post/${post.id}`)}
      position="relative"
    >
      {post.status === 'draft' && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="orange"
          zIndex={1}
        >
          Draft
        </Badge>
      )}

      <AspectRatio ratio={16 / 9}>
        <Image
          src={post.cover_image || `https://source.unsplash.com/random/800x600?${post.tags?.[0] || 'blog'}`}
          alt={post.title}
          objectFit="cover"
          loading="lazy"
          onError={() => setImageError(true)}
          fallback={<Skeleton height="100%" width="100%" />}
        />
      </AspectRatio>

      <VStack p={4} align="stretch" spacing={4}>
        {/* Author Info */}
        <HStack spacing={3} justify="space-between">
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={post.author?.email}
              src={post.author?.raw_user_meta_data?.avatar_url}
            />
            <VStack spacing={0} align="start">
              <Text fontWeight="medium" fontSize="sm">
                {post.author?.raw_user_meta_data?.full_name || post.author?.email}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {formatDate(post.created_at)}
              </Text>
            </VStack>
          </HStack>
          {isOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList onClick={(e) => e.stopPropagation()}>
                <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/edit-post/${post.id}`)}>
                  Edit
                </MenuItem>
                <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => onDelete(post.id)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        {/* Tags */}
        <HStack spacing={2} flexWrap="wrap">
          {post.tags?.map((tag) => (
            <Tag
              key={tag}
              size="sm"
              colorScheme="brand"
              variant="subtle"
              _hover={{ bg: 'brand.100' }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tags/${tag}`);
              }}
            >
              {tag}
            </Tag>
          ))}
        </HStack>

        {/* Title and Excerpt */}
        <VStack align="start" spacing={2}>
          <Heading size="md" noOfLines={2}>
            {post.title || 'Untitled Post'}
          </Heading>
          <Text color={textColor} fontSize="sm" noOfLines={3}>
            {post.excerpt || 'No excerpt available'}
          </Text>
        </VStack>

        {/* Stats and Actions */}
        <HStack justify="space-between" pt={2}>
          <HStack spacing={4} color={textColor} fontSize="sm">
            <HStack spacing={1}>
              <Icon as={FiEye} />
              <Text>{post.views || 0}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiClock} />
              <Text>{post.read_time || '5'} min</Text>
            </HStack>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label={isLiked ? 'Unlike' : 'Like'}>
              <IconButton
                icon={<Icon as={FiHeart} color={isLiked ? 'red.500' : undefined} />}
                aria-label="Like post"
                variant="ghost"
                size="sm"
                onClick={handleLike}
              />
            </Tooltip>
            {showFavoriteButton && (
              <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <IconButton
                  icon={<Icon as={FiBookmark} color={isFavorite ? 'brand.500' : undefined} />}
                  aria-label="Toggle favorite"
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                />
              </Tooltip>
            )}
            <Tooltip label="Share">
              <IconButton
                icon={<Icon as={FiShare2} />}
                aria-label="Share post"
                variant="ghost"
                size="sm"
                onClick={handleShare}
              />
            </Tooltip>
          </HStack>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

const LoadingSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      height="fit-content"
    >
      <AspectRatio ratio={16 / 9}>
        <Skeleton height="100%" width="100%" />
      </AspectRatio>
      <VStack p={4} align="start" spacing={4}>
        <HStack spacing={3} width="full">
          <Skeleton height="32px" width="32px" borderRadius="full" />
          <VStack spacing={2} flex={1} align="stretch">
            <Skeleton height="12px" width="120px" />
            <Skeleton height="12px" width="80px" />
          </VStack>
        </HStack>
        <Skeleton height="20px" width="40%" />
        <Skeleton height="24px" width="90%" />
        <Skeleton height="20px" width="100%" />
        <HStack width="100%" justify="space-between">
          <Skeleton height="20px" width="30%" />
          <HStack spacing={2}>
            <Skeleton height="32px" width="32px" borderRadius="md" />
            <Skeleton height="32px" width="32px" borderRadius="md" />
            <Skeleton height="32px" width="32px" borderRadius="md" />
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export const BlogGrid = ({ 
  posts = [], 
  loading, 
  onDelete, 
  isOwner = false, 
  showFavoriteButton = true,
  onRemoveFromFavorites,
}) => {
  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
      spacing={6}
      p={6}
    >
      {loading
        ? Array(8)
            .fill(null)
            .map((_, index) => <LoadingSkeleton key={index} />)
        : posts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={index}
              onDelete={onDelete}
              isOwner={isOwner}
              showFavoriteButton={showFavoriteButton}
              onRemoveFromFavorites={onRemoveFromFavorites}
            />
          ))}
    </SimpleGrid>
  );
};