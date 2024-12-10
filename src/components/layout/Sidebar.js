import {
  Box,
  VStack,
  HStack,
  Icon,
  Text,
  Flex,
  useColorModeValue,
  IconButton,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  FiHome,
  FiBookmark,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiEdit,
  FiUser,
  FiTrendingUp,
  FiGrid,
  FiHeart,
  FiMoreVertical,
  FiPlus,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const menuItems = [
  { name: 'Home', icon: FiHome, path: '/dashboard' },
  { name: 'My Posts', icon: FiEdit, path: '/my-posts' },
  { name: 'Favorites', icon: FiHeart, path: '/favorites' },
  { name: 'Profile', icon: FiUser, path: '/profile' },
  { name: 'Settings', icon: FiSettings, path: '/settings' },
];

export const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeColor = useColorModeValue('brand.500', 'brand.200');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotifications();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const SidebarContent = () => (
    <VStack spacing={4} align="stretch" w="full">
      {menuItems.map((item) => (
        <Tooltip
          key={item.name}
          label={isCollapsed ? item.name : ''}
          placement="right"
          hasArrow
        >
          <Button
            variant={location.pathname === item.path ? 'solid' : 'ghost'}
            colorScheme={location.pathname === item.path ? 'brand' : 'gray'}
            leftIcon={<Icon as={item.icon} />}
            justifyContent={isCollapsed ? 'center' : 'flex-start'}
            w="full"
            onClick={() => handleNavigate(item.path)}
            aria-label={item.name}
            _hover={{ bg: hoverBg }}
            position="relative"
          >
            {!isCollapsed && item.name}
            {item.name === 'Favorites' && notifications.length > 0 && (
              <Badge
                colorScheme="red"
                position="absolute"
                top={2}
                right={2}
                borderRadius="full"
              >
                {notifications.length}
              </Badge>
            )}
          </Button>
        </Tooltip>
      ))}

      <Button
        variant="solid"
        colorScheme="brand"
        leftIcon={<Icon as={FiPlus} />}
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        w="full"
        onClick={() => handleNavigate('/create-post')}
        aria-label="Create Post"
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        transition="all 0.2s"
      >
        {!isCollapsed && 'Create Post'}
      </Button>

      <Divider />

      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          w="full"
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          _hover={{ bg: hoverBg }}
        >
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={profile?.full_name || user?.email}
              src={profile?.avatar_url}
            />
            {!isCollapsed && (
              <VStack spacing={0} align="start">
                <Text fontSize="sm" fontWeight="medium">
                  {profile?.full_name || 'Anonymous User'}
                </Text>
                <Text fontSize="xs" color={textColor}>
                  {user?.email}
                </Text>
              </VStack>
            )}
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem icon={<FiUser />} onClick={() => handleNavigate('/profile')}>
            Profile
          </MenuItem>
          <MenuItem icon={<FiSettings />} onClick={() => handleNavigate('/settings')}>
            Settings
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<FiLogOut />} onClick={handleSignOut} color="red.500">
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </VStack>
  );

  // Mobile drawer
  const MobileDrawer = () => (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
        <DrawerBody>
          <SidebarContent />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <MotionBox
      position="fixed"
      left={0}
      p={4}
      w={isCollapsed ? '20' : '64'}
      top={0}
      h="100vh"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      transition="width 0.2s"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Flex direction="column" h="full" justify="space-between">
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            {!isCollapsed && (
              <MotionFlex
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, brand.400, brand.600)"
                  bgClip="text"
                  cursor="pointer"
                  onClick={() => navigate('/dashboard')}
                >
                  Lumina
                </Text>
              </MotionFlex>
            )}
            <IconButton
              aria-label="Toggle Sidebar"
              icon={<FiMenu />}
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              _hover={{ bg: hoverBg }}
            />
          </Flex>
          <SidebarContent />
        </VStack>
      </Flex>
    </MotionBox>
  );

  return (
    <>
      <Box display={{ base: 'block', md: 'none' }}>
        <IconButton
          aria-label="Open Menu"
          icon={<FiMenu />}
          onClick={onOpen}
          position="fixed"
          top={4}
          left={4}
          zIndex={20}
          colorScheme="brand"
          variant="solid"
          shadow="md"
        />
        <MobileDrawer />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <DesktopSidebar />
      </Box>
    </>
  );
}; 