// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/ProfilePage.js
// Page de profil utilisateur. Affiche les infos (username, email,
// date d'inscription, rôle) et les statistiques (signalements,
// résolus, votes reçus). Permet de modifier username/email.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Flex,
  Divider,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  // --- States ---
  const [userStats, setUserStats] = useState({ totalIssues: 0, resolvedIssues: 0, totalVotes: 0 });
  const [isEditing, setIsEditing] = useState(false);  // Mode édition actif
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Initialise le formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
      fetchUserStats();
    }
  }, [user]);

  // --- Récupère les statistiques de l'utilisateur ---
  const fetchUserStats = async () => {
    try {
      const response = await api.get('/issues/user/me');
      const issues = response.data;
      const resolvedIssues = issues.filter(issue => issue.status === 'resolved');
      // Somme des votes sur tous les signalements de l'utilisateur
      const totalVotes = issues.reduce((sum, issue) => sum + (issue.voteCount || 0), 0);
      
      setUserStats({
        totalIssues: issues.length,
        resolvedIssues: resolvedIssues.length,
        totalVotes: totalVotes
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Soumission du formulaire de modification ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(formData); // Appel AuthContext.updateProfile
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du profil' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Annule l'édition et restaure les valeurs initiales
  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  // Formate une date en français
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Center minH="calc(100vh - 64px)">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50" py={8}>
      <Container maxW="900px">
        <VStack spacing={6} align="stretch">
          {/* --- En-tête --- */}
          <Box>
            <Heading size="lg" color="gray.800">Mon Profil</Heading>
            <Text color="gray.600">Gérez vos informations personnelles et visualisez vos statistiques</Text>
          </Box>

          {/* Message de succès/erreur */}
          {message.text && (
            <Alert 
              status={message.type === 'success' ? 'success' : 'error'} 
              borderRadius="lg"
            >
              <AlertIcon />
              {message.text}
            </Alert>
          )}

          {/* --- Carte profil --- */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
            <CardHeader pb={0}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Informations personnelles</Heading>
                {!isEditing && (
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    borderRadius="lg"
                  >
                    Modifier
                  </Button>
                )}
              </Flex>
            </CardHeader>
            <CardBody>
              {/* Avatar Section */}
              <VStack spacing={4} mb={6}>
                <Avatar
                  size="2xl"
                  name={user.username}
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                />
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="xl">{user.username}</Text>
                  <Badge
                    colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {user.role === 'admin' ? '👑 Administrateur' : '👤 Citoyen'}
                  </Badge>
                </VStack>
              </VStack>

              <Divider mb={6} />

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontWeight="500">Nom d'utilisateur</FormLabel>
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        borderRadius="lg"
                        size="lg"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500">Adresse email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        borderRadius="lg"
                        size="lg"
                      />
                    </FormControl>

                    <HStack spacing={3} justify="flex-end" pt={4}>
                      <Button
                        leftIcon={<CloseIcon />}
                        variant="outline"
                        onClick={handleCancel}
                        isDisabled={loading}
                        borderRadius="lg"
                      >
                        Annuler
                      </Button>
                      <Button
                        leftIcon={<CheckIcon />}
                        colorScheme="blue"
                        type="submit"
                        isLoading={loading}
                        loadingText="Enregistrement..."
                        borderRadius="lg"
                      >
                        Enregistrer
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="gray.50" borderRadius="lg">
                    <Text fontSize="sm" color="gray.500" mb={1}>Nom d'utilisateur</Text>
                    <Text fontWeight="600" color="gray.800">{user.username}</Text>
                  </Box>
                  <Box p={4} bg="gray.50" borderRadius="lg">
                    <Text fontSize="sm" color="gray.500" mb={1}>Adresse email</Text>
                    <Text fontWeight="600" color="gray.800">{user.email}</Text>
                  </Box>
                  <Box p={4} bg="gray.50" borderRadius="lg">
                    <Text fontSize="sm" color="gray.500" mb={1}>Rôle</Text>
                    <Text fontWeight="600" color="gray.800">
                      {user.role === 'admin' ? 'Administrateur' : 'Citoyen'}
                    </Text>
                  </Box>
                  <Box p={4} bg="gray.50" borderRadius="lg">
                    <Text fontSize="sm" color="gray.500" mb={1}>Membre depuis</Text>
                    <Text fontWeight="600" color="gray.800">{formatDate(user.createdAt)}</Text>
                  </Box>
                </SimpleGrid>
              )}
            </CardBody>
          </Card>

          {/* Statistics Card */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Mes statistiques</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat
                  p={6}
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  borderRadius="xl"
                  color="white"
                >
                  <StatLabel fontSize="sm" opacity={0.9}>Signalements</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{userStats.totalIssues}</StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>Total créés</StatHelpText>
                </Stat>

                <Stat
                  p={6}
                  bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)"
                  borderRadius="xl"
                  color="white"
                >
                  <StatLabel fontSize="sm" opacity={0.9}>Résolus</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{userStats.resolvedIssues}</StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>Problèmes réglés</StatHelpText>
                </Stat>

                <Stat
                  p={6}
                  bg="linear-gradient(135deg, #ED8936 0%, #C05621 100%)"
                  borderRadius="xl"
                  color="white"
                >
                  <StatLabel fontSize="sm" opacity={0.9}>Votes reçus</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{userStats.totalVotes}</StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>Sur vos signalements</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Account Info Card */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Informations du compte</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" p={4} bg="gray.50" borderRadius="lg">
                  <Box>
                    <Text fontWeight="600" color="gray.700">Identifiant unique</Text>
                    <Text fontSize="sm" color="gray.500">{user.id}</Text>
                  </Box>
                </Flex>
                <Flex justify="space-between" p={4} bg="gray.50" borderRadius="lg">
                  <Box>
                    <Text fontWeight="600" color="gray.700">Dernière mise à jour</Text>
                    <Text fontSize="sm" color="gray.500">{formatDate(user.updatedAt)}</Text>
                  </Box>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ProfilePage;
