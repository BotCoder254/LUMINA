import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Container,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
  HStack,
  useDisclosure,
  VStack,
  CloseButton,
  Drawer,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUser, FiLogOut } from 'react-icons/fi';

export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const MenuItems = () => (
    <>
      <IconButton
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="md"
      />

      {user ? (
        <Menu>
          <MenuButton
            as={Button}
            rounded="full"
            variant="link"
            cursor="pointer"
            minW={0}
          >
            <Avatar
              size="sm"
              name={user.email}
              bg="brand.500"
              color="white"
              src={user.user_metadata?.avatar_url}
            />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiPlus />} onClick={() => navigate('/create-post')}>
              Create Post
            </MenuItem>
            <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
              Profile
            </MenuItem>
            <MenuItem icon={<FiLogOut />} onClick={handleSignOut}>
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <Button
          colorScheme="brand"
          variant="solid"
          size="sm"
          onClick={() => navigate('/signin')}
        >
          Sign In
        </Button>
      )}
    </>
  );

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      px={4}
      position="fixed"
      w="100%"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="ghost"
            aria-label="Open menu"
            icon={<HamburgerIcon />}
          />

          <Heading
            size="md"
            cursor="pointer"
            onClick={() => navigate('/')}
            color={useColorModeValue('brand.500', 'brand.200')}
            fontWeight="bold"
          >
            Lumina
          </Heading>

          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            <MenuItems />
          </HStack>

          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Heading
                  size="md"
                  cursor="pointer"
                  onClick={() => {
                    navigate('/');
                    onClose();
                  }}
                  color={useColorModeValue('brand.500', 'brand.200')}
                >
                  Lumina
                </Heading>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
              </Flex>
              <VStack align="stretch" p={4}>
                <MenuItems />
              </VStack>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Container>
    </Box>
  );
}; 