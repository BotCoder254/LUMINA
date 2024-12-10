import {
  Box,
  Image,
  Text,
  Stack,
  Heading,
  useColorModeValue,
  HStack,
  Icon,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from '@chakra-ui/react';
import {
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiShare2,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export const BlogCard = ({ post, onEdit, onDelete, showActions = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.origin + `/post/${post.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <MotionBox
      as="article"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      shadow="md"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box position="relative" onClick={handleCardClick} cursor="pointer">
        <Image
          src={post.cover_image || 'https://via.placeholder.com/600x400'}
          alt={post.title}
          w="full"
          h="200px"
          objectFit="cover"
          transition="transform 0.2s"
          transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
        />
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="brand"
          borderRadius="full"
          px={3}
          py={1}
        >
          {post.category}
        </Badge>
      </Box>

      <Stack p={6} spacing={4}>
        <Heading
          as="h3"
          size="md"
          cursor="pointer"
          onClick={handleCardClick}
          _hover={{ color: 'brand.500' }}
          noOfLines={2}
        >
          {post.title}
        </Heading>

        <Text color={textColor} noOfLines={3}>
          {post.excerpt}
        </Text>

        <HStack spacing={4} justify="space-between" align="center">
          <HStack spacing={2}>
            <Avatar
              size="sm"
              name={post.profiles?.full_name}
              src={post.profiles?.avatar_url}
            />
            <Stack spacing={0}>
              <Text fontWeight="medium" fontSize="sm">
                {post.profiles?.full_name || 'Anonymous'}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {formatDate(post.created_at)}
              </Text>
            </Stack>
          </HStack>

          <HStack spacing={4}>
            <HStack spacing={1}>
              <Icon as={FiHeart} color={textColor} />
              <Text fontSize="sm" color={textColor}>
                {post.likes_count || 0}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiMessageSquare} color={textColor} />
              <Text fontSize="sm" color={textColor}>
                {post.comments_count || 0}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiEye} color={textColor} />
              <Text fontSize="sm" color={textColor}>
                {post.views || 0}
              </Text>
            </HStack>
          </HStack>
        </HStack>

        {showActions && user?.id === post.user_id && (
          <Box position="absolute" top={4} right={4}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: 'blackAlpha.300' }}
              />
              <MenuList>
                <MenuItem icon={<FiEdit2 />} onClick={() => onEdit(post)}>
                  Edit
                </MenuItem>
                <MenuItem icon={<FiTrash2 />} onClick={() => onDelete(post.id)}>
                  Delete
                </MenuItem>
                <MenuItem icon={<FiShare2 />} onClick={handleShare}>
                  Share
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        )}
      </Stack>
    </MotionBox>
  );
}; 