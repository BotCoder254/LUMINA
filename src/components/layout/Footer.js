import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Icon,
  Heading,
  ButtonGroup,
  IconButton,
  Input,
  Button,
  VStack,
  Divider,
} from '@chakra-ui/react';
import {
  FiTwitter,
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiMail,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

export const Footer = () => {
  const year = new Date().getFullYear();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'white');

  return (
    <MotionBox
      bg={bgColor}
      color={textColor}
      borderTop="1px"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container as={Stack} maxW="container.xl" py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Heading
                as="h2"
                fontSize="2xl"
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
              >
                Lumina Blog
              </Heading>
              <Text fontSize="sm" mt={2}>
                Share your stories with the world
              </Text>
            </Box>
            <Text fontSize="sm">
              © {year} Lumina Blog. All rights reserved
            </Text>
            <ButtonGroup variant="ghost">
              <IconButton
                as="a"
                href="#"
                aria-label="Twitter"
                icon={<FiTwitter fontSize="20px" />}
                _hover={{ color: 'brand.500' }}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="GitHub"
                icon={<FiGithub fontSize="20px" />}
                _hover={{ color: 'brand.500' }}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="LinkedIn"
                icon={<FiLinkedin fontSize="20px" />}
                _hover={{ color: 'brand.500' }}
              />
              <IconButton
                as="a"
                href="#"
                aria-label="Instagram"
                icon={<FiInstagram fontSize="20px" />}
                _hover={{ color: 'brand.500' }}
              />
            </ButtonGroup>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>About us</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Blog</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Contact us</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Pricing</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Testimonials</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Help Center</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Terms of Service</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Legal</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Privacy Policy</Link>
            <Link href={'#'} _hover={{ color: 'brand.500' }}>Status</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Stay up to date</ListHeader>
            <Stack direction={'row'} spacing={2} align={'center'}>
              <Input
                placeholder={'Your email address'}
                bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
                border={0}
                _focus={{
                  bg: 'whiteAlpha.300',
                }}
              />
              <Button
                colorScheme="brand"
                leftIcon={<Icon as={FiMail} />}
                aria-label="Subscribe"
              >
                Subscribe
              </Button>
            </Stack>
            <Text fontSize="sm" mt={2}>
              Get the latest updates and news straight to your inbox.
            </Text>
          </Stack>
        </SimpleGrid>

        <Divider my={6} borderColor={borderColor} />

        <VStack spacing={2} align="center" fontSize="sm">
          <Text>
            Made with ❤️ by the Lumina Team
          </Text>
          <Text>
            Empowering writers and readers worldwide
          </Text>
        </VStack>
      </Container>
    </MotionBox>
  );
}; 