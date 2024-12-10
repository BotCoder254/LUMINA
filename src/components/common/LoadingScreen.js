import React from 'react';
import {
  Box,
  Container,
  VStack,
  Spinner,
  Text,
  useColorModeValue
} from '@chakra-ui/react';

export const LoadingScreen = ({ message = 'Loading...' }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="lg">
        <VStack spacing={6}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500"
            size="xl"
          />
          <Text
            fontSize="lg"
            color={textColor}
            textAlign="center"
          >
            {message}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}; 