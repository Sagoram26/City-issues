import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Progress,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, AtSignIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColor = passwordStrength <= 25 ? 'red' : passwordStrength <= 50 ? 'orange' : passwordStrength <= 75 ? 'yellow' : 'green';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'citizen'
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de l\'inscription');
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
              Rejoignez CityTracker
            </Heading>
            <Text fontSize="md" color="gray.600">
              Créez votre compte et participez à l'amélioration de votre ville
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
                      Nom d'utilisateur
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={AtSignIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Votre pseudo"
                        size="lg"
                        borderRadius="xl"
                        isDisabled={loading}
                      />
                    </InputGroup>
                  </FormControl>

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
                        placeholder="Au moins 6 caractères"
                        size="lg"
                        borderRadius="xl"
                        isDisabled={loading}
                      />
                    </InputGroup>
                    {formData.password && (
                      <Box mt={2}>
                        <Progress
                          value={passwordStrength}
                          size="xs"
                          colorScheme={strengthColor}
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Force du mot de passe : {passwordStrength <= 25 ? 'Faible' : passwordStrength <= 50 ? 'Moyen' : passwordStrength <= 75 ? 'Bon' : 'Excellent'}
                        </Text>
                      </Box>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="500" color="gray.700">
                      Confirmer le mot de passe
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={LockIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Répétez le mot de passe"
                        size="lg"
                        borderRadius="xl"
                        isDisabled={loading}
                        isInvalid={formData.confirmPassword && formData.password !== formData.confirmPassword}
                      />
                    </InputGroup>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        Les mots de passe ne correspondent pas
                      </Text>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    fontSize="md"
                    fontWeight="600"
                    borderRadius="xl"
                    isLoading={loading}
                    loadingText="Création..."
                    w="full"
                    mt={2}
                  >
                    Créer mon compte
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
                Déjà un compte ?{' '}
                <Link
                  as={RouterLink}
                  to="/login"
                  color="blue.500"
                  fontWeight="600"
                  _hover={{ color: 'blue.600', textDecoration: 'underline' }}
                >
                  Se connecter
                </Link>
              </Text>
            </CardBody>
          </Card>

          {/* Footer */}
          <Text fontSize="sm" color="gray.500" textAlign="center">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default RegisterPage;
