// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/LoginPage.js
// Page de connexion. Formulaire email/password, appel à AuthContext
// pour login(), redirection vers la page d'origine après connexion.
// ═══════════════════════════════════════════════════════════════════════════

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
  // --- States du formulaire ---
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');        // Message d'erreur
  const [loading, setLoading] = useState(false); // Chargement en cours
  
  const { login } = useAuth();  // Fonction login du contexte
  const navigate = useNavigate();
  const location = useLocation();
  
  // Page d'origine pour redirection après connexion
  const from = location.state?.from?.pathname || '/';
  const cardBg = useColorModeValue('white', 'gray.800');

  // Gère les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Efface l'erreur quand l'utilisateur tape
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(formData.email, formData.password); // Appel API + stockage token
      navigate(from, { replace: true });              // Redirige vers la page d'origine
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="calc(100vh - 64px)" py={12} px={4} bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)">
      <Container maxW="md">
        <Stack spacing={8} align="center">
          {/* --- En-tête --- */}
          <Stack spacing={2} textAlign="center">
            <Heading 
              fontSize="3xl" 
              fontWeight="bold" 
              bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
              bgClip="text"
            >
              Bon retour parmi nous
            </Heading>
            <Text fontSize="md" color="whiteAlpha.700">
              Connectez-vous pour accéder à votre compte
            </Text>
          </Stack>

          {/* --- Carte formulaire --- */}
          <Card 
            w="full" 
            bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
            backdropFilter="blur(10px)"
            shadow="xl" 
            borderRadius="2xl"
            border="1px"
            borderColor="rgba(90, 110, 255, 0.2)"
          >
            <CardBody p={8}>
              {/* Affichage de l'erreur */}
              {error && (
                <Alert status="error" borderRadius="lg" mb={6}>
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={5}>
                  {/* Champ email */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="500" color="white">
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

                  {/* Champ mot de passe */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="500" color="white">
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

                  {/* Bouton de connexion */}
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

              {/* Séparateur */}
              <HStack my={6}>
                <Divider />
                <Text fontSize="sm" color="whiteAlpha.500" whiteSpace="nowrap" px={2}>
                  ou
                </Text>
                <Divider />
              </HStack>

              {/* Lien vers inscription */}
              <Text textAlign="center" color="whiteAlpha.700">
                Pas encore de compte ?{' '}
                <Link
                  as={RouterLink}
                  to="/register"
                  bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                  bgClip="text"
                  fontWeight="600"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Créer un compte
                </Link>
              </Text>
            </CardBody>
          </Card>

          {/* Pied de page */}
          <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;
