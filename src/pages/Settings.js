import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
  Button,
  Divider,
  useToast,
  HStack,
  Icon,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiBell, FiGlobe, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

export const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    twoFactorAuth: false,
  });

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Save settings to Supabase here
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Settings</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Manage your account settings and preferences
            </Text>
          </Box>

          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <HStack spacing={4}>
                    <Icon as={FiMail} color="brand.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="medium">Email Notifications</Text>
                      <Text fontSize="sm" color="gray.500">
                        Receive email updates about your account
                      </Text>
                    </Box>
                  </HStack>
                  <Switch
                    isChecked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                    colorScheme="brand"
                  />
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={4}>
                    <Icon as={FiBell} color="brand.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="medium">Push Notifications</Text>
                      <Text fontSize="sm" color="gray.500">
                        Receive push notifications in your browser
                      </Text>
                    </Box>
                  </HStack>
                  <Switch
                    isChecked={settings.pushNotifications}
                    onChange={() => handleSettingChange('pushNotifications')}
                    colorScheme="brand"
                  />
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={4}>
                    <Icon as={FiGlobe} color="brand.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="medium">Public Profile</Text>
                      <Text fontSize="sm" color="gray.500">
                        Make your profile visible to everyone
                      </Text>
                    </Box>
                  </HStack>
                  <Switch
                    isChecked={settings.publicProfile}
                    onChange={() => handleSettingChange('publicProfile')}
                    colorScheme="brand"
                  />
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={4}>
                    <Icon as={FiLock} color="brand.500" boxSize={5} />
                    <Box>
                      <Text fontWeight="medium">Two-Factor Authentication</Text>
                      <Text fontSize="sm" color="gray.500">
                        Add an extra layer of security to your account
                      </Text>
                    </Box>
                  </HStack>
                  <Switch
                    isChecked={settings.twoFactorAuth}
                    onChange={() => handleSettingChange('twoFactorAuth')}
                    colorScheme="brand"
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Button
            colorScheme="brand"
            size="lg"
            onClick={handleSaveSettings}
            isLoading={loading}
          >
            Save Changes
          </Button>
        </VStack>
      </MotionBox>
    </Container>
  );
}; 