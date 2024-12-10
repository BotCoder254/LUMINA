import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  useToast,
  HStack,
  Input,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { BlogGrid } from '../components/blog/BlogGrid';
import { useSearchParams } from 'react-router-dom';

const MotionBox = motion(Box);

export const MyPosts = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  useEffect(() => {
    fetchPosts();
    fetchTags();

    // Set up real-time subscription
    const postsSubscription = supabase
      .channel('my_posts_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `author=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'DELETE') {
            setPosts((current) => current.filter((post) => post.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPosts((current) =>
              current.map((post) => (post.id === payload.new.id ? payload.new : post))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
    };
  }, [user.id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author(
            email,
            id,
            raw_user_meta_data
          )
        `)
        .eq('author', user.id)
        .order('created_at', { ascending: false });

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

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('tags')
        .eq('author', user.id);

      if (error) throw error;

      // Extract unique tags from all posts
      const tags = new Set();
      data.forEach(post => {
        post.tags?.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: 'Post deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting post',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filterPosts = (posts) => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => post.tags?.includes(tag));
      const matchesStatus = !statusFilter || post.status === statusFilter;
      return matchesSearch && matchesTags && matchesStatus;
    });
  };

  const sortPosts = (posts) => {
    switch (sortBy) {
      case 'newest':
        return [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return [...posts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'popular':
        return [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return posts;
    }
  };

  const filteredAndSortedPosts = sortPosts(filterPosts(posts));

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>My Posts</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Manage and organize your blog posts
            </Text>
          </Box>

          <Box>
            <HStack spacing={4} mb={8}>
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="400px"
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                w="200px"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </Select>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiFilter />}
                  variant="outline"
                  aria-label="Filter by tags"
                />
                <MenuList>
                  {availableTags.map(tag => (
                    <MenuItem
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      <HStack justify="space-between" width="100%">
                        <Text>{tag}</Text>
                        {selectedTags.includes(tag) && <Badge colorScheme="brand">Selected</Badge>}
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </HStack>
          </Box>

          <Tabs colorScheme="brand" variant="enclosed">
            <TabList>
              <Tab>All Posts</Tab>
              <Tab>Published</Tab>
              <Tab>Drafts</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0} pt={6}>
                <BlogGrid
                  posts={filteredAndSortedPosts}
                  loading={loading}
                  onDelete={handleDeletePost}
                  isOwner={true}
                />
              </TabPanel>
              <TabPanel p={0} pt={6}>
                <BlogGrid
                  posts={filteredAndSortedPosts.filter(post => post.status === 'published')}
                  loading={loading}
                  onDelete={handleDeletePost}
                  isOwner={true}
                />
              </TabPanel>
              <TabPanel p={0} pt={6}>
                <BlogGrid
                  posts={filteredAndSortedPosts.filter(post => post.status === 'draft')}
                  loading={loading}
                  onDelete={handleDeletePost}
                  isOwner={true}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </MotionBox>
    </Container>
  );
}; 