import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Input,
  Textarea,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Select,
  HStack,
  useColorModeValue,
  Heading,
  Text,
  IconButton,
  Flex,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { FiImage, FiX } from 'react-icons/fi';

export const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;
      if (image) {
        // Create a unique file name
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // First, ensure the bucket exists
        const { data: bucketExists } = await supabase
          .storage
          .getBucket('blog-images');

        if (!bucketExists) {
          // Create the bucket if it doesn't exist
          const { error: createBucketError } = await supabase
            .storage
            .createBucket('blog-images', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
            });

          if (createBucketError) throw createBucketError;
        }

        // Upload the image
        const { error: uploadError } = await supabase
          .storage
          .from('blog-images')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('blog-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Create the post
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            category,
            image_url: imageUrl,
            author: user.id,
            status: 'published',
            created_at: new Date().toISOString(),
          },
        ]);

      if (postError) throw postError;

      toast({
        title: 'Post created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/my-posts');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error creating post',
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
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Create New Post</Heading>
          <Text color="gray.500">Share your thoughts with the community</Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg={bgColor}
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                size="lg"
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select category"
                size="lg"
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
              >
                <option value="technology">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="health">Health</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                minH="300px"
                size="lg"
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Cover Image</FormLabel>
              <HStack spacing={4} align="flex-start">
                <Button
                  as="label"
                  leftIcon={<FiImage />}
                  cursor="pointer"
                  htmlFor="image-upload"
                  colorScheme="brand"
                  variant="outline"
                  size="lg"
                >
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </Button>
                {imagePreview && (
                  <Box position="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <IconButton
                      icon={<FiX />}
                      size="sm"
                      position="absolute"
                      top={-2}
                      right={-2}
                      onClick={removeImage}
                      aria-label="Remove image"
                      colorScheme="red"
                      rounded="full"
                    />
                  </Box>
                )}
              </HStack>
              <Text mt={2} fontSize="sm" color="gray.500">
                Maximum file size: 5MB
              </Text>
            </FormControl>

            <HStack spacing={4} width="100%" justify="flex-end" pt={4}>
              <Button
                variant="outline"
                onClick={() => navigate('/my-posts')}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                type="submit"
                isLoading={loading}
                loadingText="Creating..."
                size="lg"
              >
                Publish Post
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}; 