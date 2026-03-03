import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  Icon,
  Divider,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="calc(100vh - 64px)" py={12} px={4} bg="gray.50">
      <Container maxW="md">
        <Stack spacing={8} align="center">
          {/* Header */}
          <Stack spacing={2} textAlign="center">
            <Heading fontSize="3xl" fontWeight="bold" color="gray.800">
              Bon retour parmi nous
            </Heading>
            <Text fontSize="md" color="gray.600">
              Connectez-vous pour accéder à votre compte
            </Text>
          </Stack>

          {/* Card */}
          <Card w="full" bg={cardBg} shadow="xl" borderRadius="2xl">
            <CardBody p={8}>
              {error && (
                <Alert status="error" borderRadius="lg" mb={6}>
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="500" color="gray.700">
                      Adresse email
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={EmailIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        size="lg"
                        borderRadius="xl"
                        isDisabled={loading}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="500" color="gray.700">
                      Mot de passe
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={LockIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        size="lg"
                        borderRadius="xl"
                        isDisabled={loading}
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    fontSize="md"
                    fontWeight="600"
                    borderRadius="xl"
                    isLoading={loading}
                    loadingText="Connexion..."
                    w="full"
                    mt={2}
                  >
                    Se connecter
                  </Button>
                </Stack>
              </form>

              <HStack my={6}>
                <Divider />
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" px={2}>
                  ou
                </Text>
                <Divider />
              </HStack>

              <Text textAlign="center" color="gray.600">
                Pas encore de compte ?{' '}
                <Link
                  as={RouterLink}
                  to="/register"
                  color="blue.500"
                  fontWeight="600"
                  _hover={{ color: 'blue.600', textDecoration: 'underline' }}
                >
                  Créer un compte
                </Link>
              </Text>
            </CardBody>
          </Card>

          {/* Footer */}
          <Text fontSize="sm" color="gray.500" textAlign="center">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;
