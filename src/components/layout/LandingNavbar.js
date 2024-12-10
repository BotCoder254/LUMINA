import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
  useColorMode,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DesktopSubNav = ({ label, href, subLabel }) => {
  const linkHoverBg = useColorModeValue('brand.50', 'gray.900');
  const linkHoverColor = useColorModeValue('brand.500', 'brand.200');
  const iconColor = useColorModeValue('brand.500', 'brand.200');

  return (
    <Link
      href={href}
      role="group"
      display="block"
      p={2}
      rounded="md"
      _hover={{ bg: linkHoverBg }}
    >
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            _groupHover={{ color: linkHoverColor }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize="sm">{subLabel}</Text>
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon color={iconColor} w={5} h={5} as={FiChevronRight} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverColor = useColorModeValue('brand.500', 'brand.200');

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? '#'}
        justify="space-between"
        align="center"
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text fontWeight={600} color={textColor}>
          {label}
        </Text>
        {children && (
          <Icon
            as={FiChevronDown}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle="solid"
          borderColor={borderColor}
          align="start"
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                py={2}
                href={child.href}
                color={textColor}
                _hover={{
                  color: hoverColor,
                }}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.500', 'brand.200');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction="row" spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Link
                p={2}
                href={navItem.href ?? '#'}
                fontSize="sm"
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={FiChevronDown}
                    h={5}
                    w={5}
                    ml={1}
                    transform="translateY(2px)"
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                bg={popoverContentBgColor}
                p={4}
                rounded="xl"
                minW="sm"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

export const LandingNavbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <MotionBox
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        bg={useColorModeValue('white', 'gray.800')}
        position="fixed"
        top={0}
        w="full"
        zIndex={1000}
      >
        <Container maxW="container.xl">
          <Flex
            color={useColorModeValue('gray.600', 'white')}
            minH="60px"
            py={{ base: 2 }}
            px={{ base: 4 }}
            align="center"
          >
            <Flex
              flex={{ base: 1, md: 'auto' }}
              ml={{ base: -2 }}
              display={{ base: 'flex', md: 'none' }}
            >
              <IconButton
                onClick={onToggle}
                icon={isOpen ? <FiX /> : <FiMenu />}
                variant="ghost"
                aria-label="Toggle Navigation"
              />
            </Flex>
            <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontWeight="bold"
                fontSize="xl"
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
                cursor="pointer"
                onClick={() => navigate('/')}
              >
                Lumina Blog
              </Text>

              <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                <DesktopNav />
              </Flex>
            </Flex>

            <Stack
              flex={{ base: 1, md: 0 }}
              justify="flex-end"
              direction="row"
              spacing={6}
              align="center"
            >
              <IconButton
                aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                onClick={toggleColorMode}
                variant="ghost"
                color={useColorModeValue('brand.500', 'brand.200')}
              />
              <Button
                as="a"
                fontSize="sm"
                fontWeight={400}
                variant="link"
                onClick={() => navigate('/signin')}
                color={useColorModeValue('gray.600', 'gray.200')}
                _hover={{
                  color: useColorModeValue('brand.500', 'brand.200'),
                }}
              >
                Sign In
              </Button>
              <Button
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize="sm"
                fontWeight={600}
                colorScheme="brand"
                onClick={() => navigate('/signup')}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </Flex>

          <Collapse in={isOpen} animateOpacity>
            <MobileNav />
          </Collapse>
        </Container>
      </Box>
    </MotionBox>
  );
};

const MobileNav = () => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Stack bg={bg} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Features',
    children: [
      {
        label: 'Writing Tools',
        subLabel: 'Professional writing and editing tools',
        href: '#',
      },
      {
        label: 'Analytics',
        subLabel: 'Track your content performance',
        href: '#',
      },
    ],
  },
  {
    label: 'Explore',
    children: [
      {
        label: 'Popular Posts',
        subLabel: 'Trending content from our community',
        href: '#',
      },
      {
        label: 'Categories',
        subLabel: 'Browse posts by topic',
        href: '#',
      },
    ],
  },
  {
    label: 'Resources',
    children: [
      {
        label: 'Documentation',
        subLabel: 'Learn how to use our platform',
        href: '#',
      },
      {
        label: 'Blog',
        subLabel: 'Latest news and updates',
        href: '#',
      },
    ],
  },
  {
    label: 'About',
    href: '#',
  },
]; 