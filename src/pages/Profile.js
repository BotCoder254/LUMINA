import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Avatar,
  VStack,
  HStack,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Image,
  Grid,
  GridItem,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { BlogCard } from '../components/blog/BlogCard';
import { FiEdit2, FiCamera, FiUpload, FiX, FiSave, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiBookmark } from 'react-icons/fi';
import { Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Get profile data with follower counts and stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          followers:followers!followers_following_id_fkey(count),
          following:followers!followers_follower_id_fkey(count),
          posts:posts(count),
          total_views:posts(sum(views_count)),
          settings,
          role
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get user metadata from auth
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const mergedProfile = {
        ...profileData,
        email: userData.email,
        created_at: userData.created_at,
        last_sign_in_at: userData.last_sign_in_at,
      };

      setProfile(mergedProfile);
      setEditedProfile(mergedProfile);

      // Set up real-time subscriptions
      const profileSubscription = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setProfile((current) => ({ ...current, ...payload.new }));
            }
          }
        )
        .subscribe();

      const followerSubscription = supabase
        .channel('follower-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'followers',
            filter: `following_id=eq.${user.id}`,
          },
          () => {
            fetchProfile(); // Refresh profile to get updated counts
          }
        )
        .subscribe();

      const notificationSubscription = supabase
        .channel('notification-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            toast({
              title: 'New Notification',
              description: getNotificationMessage(payload.new),
              status: 'info',
              duration: 5000,
              isClosable: true,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileSubscription);
        supabase.removeChannel(followerSubscription);
        supabase.removeChannel(notificationSubscription);
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error fetching profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes(count),
          comments(count),
          favorites(count),
          views(count),
          tags:post_tags(
            tag:tags(
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data);

      // Set up real-time subscription for posts
      const postsSubscription = supabase
        .channel('posts-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setPosts((current) => [payload.new, ...current]);
            } else if (payload.eventType === 'DELETE') {
              setPosts((current) =>
                current.filter((post) => post.id !== payload.old.id)
              );
            } else if (payload.eventType === 'UPDATE') {
              setPosts((current) =>
                current.map((post) =>
                  post.id === payload.new.id ? payload.new : post
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postsSubscription);
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error fetching posts',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newImages = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result);
          if (newImages.length === files.length) {
            setSelectedImages([...selectedImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(editedProfile)
        .eq('id', user.id);

      if (error) throw error;

      // Upload images if any
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          const file = await fetch(image).then((r) => r.blob());
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile_images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
        }
      }

      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationMessage = (notification) => {
    const actorName = notification.data?.actor_name || 'Someone';
    switch (notification.type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'comment':
        return `${actorName} commented on your post`;
      case 'follow':
        return `${actorName} started following you`;
      case 'mention':
        return `${actorName} mentioned you in a post`;
      case 'reply':
        return `${actorName} replied to your comment`;
      default:
        return 'You have a new notification';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          bg={bgColor}
          shadow="lg"
          rounded="xl"
          p={8}
          mb={8}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="center">
            <Box position="relative">
              <Avatar
                size="2xl"
                name={profile?.full_name || user?.email}
                src={profile?.avatar_url}
                cursor="pointer"
                onClick={onOpen}
              />
              <IconButton
                aria-label="Change avatar"
                icon={<FiCamera />}
                size="sm"
                colorScheme="brand"
                rounded="full"
                position="absolute"
                bottom={0}
                right={0}
                onClick={onOpen}
              />
            </Box>

            <VStack align="start" flex={1} spacing={4}>
              {isEditing ? (
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={editedProfile?.full_name || ''}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, full_name: e.target.value })
                    }
                  />
                </FormControl>
              ) : (
                <Heading size="lg">{profile?.full_name || 'Anonymous User'}</Heading>
              )}
              
              <Text color="gray.500">{user?.email}</Text>
              
              {isEditing ? (
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    value={editedProfile?.bio || ''}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, bio: e.target.value })
                    }
                  />
                </FormControl>
              ) : (
                <Text>{profile?.bio || 'No bio available'}</Text>
              )}

              <HStack>
                {isEditing ? (
                  <>
                    <Button
                      leftIcon={<FiSave />}
                      colorScheme="brand"
                      onClick={handleSaveProfile}
                      isLoading={isLoading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    leftIcon={<FiEdit2 />}
                    colorScheme="brand"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </HStack>
            </VStack>

            <SimpleGrid
              columns={{ base: 2, md: 4 }}
              spacing={4}
              w={{ base: 'full', md: 'auto' }}
            >
              <Stat>
                <StatLabel>Posts</StatLabel>
                <StatNumber>{posts.length}</StatNumber>
                <StatHelpText>Total published</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Views</StatLabel>
                <StatNumber>
                  {profile?.total_views || 0}
                </StatNumber>
                <StatHelpText>All time</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Followers</StatLabel>
                <StatNumber>{profile?.followers || 0}</StatNumber>
                <StatHelpText>Growing community</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Following</StatLabel>
                <StatNumber>{profile?.following || 0}</StatNumber>
                <StatHelpText>Inspiring others</StatHelpText>
              </Stat>
            </SimpleGrid>
          </Stack>

          {isEditing && (
            <>
              <Divider my={6} />
              <VStack spacing={4} align="stretch">
                <Heading size="md">Gallery</Heading>
                <HStack>
                  <Button
                    leftIcon={<FiUpload />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Images
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </HStack>
                
                <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
                  {selectedImages.map((image, index) => (
                    <GridItem key={index} position="relative">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        borderRadius="md"
                        objectFit="cover"
                        w="full"
                        h="150px"
                      />
                      <IconButton
                        icon={<FiX />}
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </>
          )}
        </Box>

        <Tabs colorScheme="brand" isLazy variant="enclosed-colored">
          <TabList>
            <Tab>Posts</Tab>
            <Tab>Activity</Tab>
            <Tab>About</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} showActions />
                ))}
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {posts.slice(0, 5).map((post) => (
                  <Box
                    key={post.id}
                    p={4}
                    bg={bgColor}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{post.title}</Text>
                        <HStack spacing={4} color="gray.500" fontSize="sm">
                          <Text>
                            {new Date(post.created_at).toLocaleDateString()}
                          </Text>
                          <HStack>
                            <Icon as={FiHeart} />
                            <Text>{post.likes || 0}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiMessageSquare} />
                            <Text>{post.comments || 0}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiBookmark} />
                            <Text>{post.favorites || 0}</Text>
                          </HStack>
                        </HStack>
                      </VStack>
                      <Badge
                        colorScheme={
                          post.status === 'published'
                            ? 'green'
                            : post.status === 'draft'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {post.status}
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <VStack align="start" spacing={6}>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Bio
                    </Heading>
                    <Text>{profile?.bio || 'No bio available'}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Location
                    </Heading>
                    <Text>{profile?.location || 'Not specified'}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Website
                    </Heading>
                    <Text>{profile?.website || 'Not specified'}</Text>
                  </Box>
                </VStack>
                <VStack align="start" spacing={6}>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Member Since
                    </Heading>
                    <Text>
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not available'}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Last Active
                    </Heading>
                    <Text>
                      {profile?.last_sign_in_at
                        ? new Date(profile.last_sign_in_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Not available'}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Email
                    </Heading>
                    <Text>{profile?.email || 'Not available'}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>
                      Social Links
                    </Heading>
                    <HStack spacing={4}>
                      {profile?.twitter && (
                        <IconButton
                          as="a"
                          href={`https://twitter.com/${profile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter"
                          icon={<FiTwitter />}
                          colorScheme="twitter"
                          variant="ghost"
                        />
                      )}
                      {profile?.github && (
                        <IconButton
                          as="a"
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                          icon={<FiGithub />}
                          colorScheme="gray"
                          variant="ghost"
                        />
                      )}
                      {profile?.linkedin && (
                        <IconButton
                          as="a"
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                          icon={<FiLinkedin />}
                          colorScheme="linkedin"
                          variant="ghost"
                        />
                      )}
                    </HStack>
                  </Box>
                </VStack>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MotionBox>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Profile Picture</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Avatar
                size="2xl"
                name={profile?.full_name || user?.email}
                src={profile?.avatar_url}
              />
              <Button
                leftIcon={<FiUpload />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload New Picture
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}; 