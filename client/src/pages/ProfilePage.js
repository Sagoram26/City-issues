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
      <Center minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)" py={8}>
      <Container maxW="900px">
        <VStack spacing={6} align="stretch">
          {/* --- En-tête --- */}
          <Box>
            <Heading 
              size="lg" 
              bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
              bgClip="text"
            >
              Mon Profil
            </Heading>
            <Text color="whiteAlpha.700">Gérez vos informations personnelles et visualisez vos statistiques</Text>
          </Box>

          {/* Message de succès/erreur */}
          {message.text && (
            <Alert 
              status={message.type === 'success' ? 'success' : 'error'} 
              borderRadius="lg"
              bg={message.type === 'success' ? 'rgba(0, 179, 144, 0.2)' : 'rgba(230, 0, 0, 0.1)'}
              borderColor={message.type === 'success' ? 'rgba(0, 179, 144, 0.4)' : 'rgba(230, 0, 0, 0.3)'}
              border="1px"
            >
              <AlertIcon />
              {message.text}
            </Alert>
          )}

          {/* --- Carte profil --- */}
          <Card 
            bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
            backdropFilter="blur(10px)"
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor="rgba(90, 110, 255, 0.2)"
          >
            <CardHeader pb={0}>
              <Flex justify="space-between" align="center">
                <Heading size="md" color="white">Informations personnelles</Heading>
                {!isEditing && (
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    borderRadius="lg"
                    color="whiteAlpha.800"
                    borderColor="rgba(90, 110, 255, 0.5)"
                    _hover={{ bg: 'rgba(90, 110, 255, 0.2)' }}
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
                  bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                  color="white"
                />
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="xl" color="white">{user.username}</Text>
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

              <Divider mb={6} borderColor="rgba(90, 110, 255, 0.2)" />

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontWeight="500" color="white">Nom d'utilisateur</FormLabel>
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        borderRadius="lg"
                        size="lg"
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                        _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 1px #5A6EFF" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500" color="white">Adresse email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        borderRadius="lg"
                        size="lg"
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                        _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 1px #5A6EFF" }}
                      />
                    </FormControl>

                    <HStack spacing={3} justify="flex-end" pt={4}>
                      <Button
                        leftIcon={<CloseIcon />}
                        variant="outline"
                        onClick={handleCancel}
                        isDisabled={loading}
                        borderRadius="lg"
                        color="whiteAlpha.800"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ bg: 'rgba(90, 110, 255, 0.2)' }}
                      >
                        Annuler
                      </Button>
                      <Button
                        leftIcon={<CheckIcon />}
                        bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
                        color="white"
                        type="submit"
                        isLoading={loading}
                        loadingText="Enregistrement..."
                        borderRadius="lg"
                        _hover={{ bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)" }}
                      >
                        Enregistrer
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="rgba(42, 49, 89, 0.5)" borderRadius="lg" border="1px" borderColor="rgba(90, 110, 255, 0.2)">
                    <Text fontSize="sm" color="whiteAlpha.600" mb={1}>Nom d'utilisateur</Text>
                    <Text fontWeight="600" color="white">{user.username}</Text>
                  </Box>
                  <Box p={4} bg="rgba(42, 49, 89, 0.5)" borderRadius="lg" border="1px" borderColor="rgba(90, 110, 255, 0.2)">
                    <Text fontSize="sm" color="whiteAlpha.600" mb={1}>Adresse email</Text>
                    <Text fontWeight="600" color="white">{user.email}</Text>
                  </Box>
                  <Box p={4} bg="rgba(42, 49, 89, 0.5)" borderRadius="lg" border="1px" borderColor="rgba(90, 110, 255, 0.2)">
                    <Text fontSize="sm" color="whiteAlpha.600" mb={1}>Rôle</Text>
                    <Text fontWeight="600" color="white">
                      {user.role === 'admin' ? 'Administrateur' : 'Citoyen'}
                    </Text>
                  </Box>
                  <Box p={4} bg="rgba(42, 49, 89, 0.5)" borderRadius="lg" border="1px" borderColor="rgba(90, 110, 255, 0.2)">
                    <Text fontSize="sm" color="whiteAlpha.600" mb={1}>Membre depuis</Text>
                    <Text fontWeight="600" color="white">{formatDate(user.createdAt)}</Text>
                  </Box>
                </SimpleGrid>
              )}
            </CardBody>
          </Card>

          {/* Statistics Card */}
          <Card 
            bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
            backdropFilter="blur(10px)"
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor="rgba(90, 110, 255, 0.2)"
          >
            <CardHeader>
              <Heading size="md" color="white">Mes statistiques</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat
                  p={6}
                  bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                  borderRadius="xl"
                  color="white"
                  boxShadow="0 8px 32px rgba(90, 110, 255, 0.3)"
                >
                  <StatLabel fontSize="sm" opacity={0.9}>Signalements</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{userStats.totalIssues}</StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>Total créés</StatHelpText>
                </Stat>

                <Stat
                  p={6}
                  bgGradient="linear-gradient(135deg, #00B390 0%, #25C4FF 100%)"
                  borderRadius="xl"
                  color="white"
                  boxShadow="0 8px 32px rgba(0, 184, 245, 0.3)"
                >
                  <StatLabel fontSize="sm" opacity={0.9}>Résolus</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{userStats.resolvedIssues}</StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>Problèmes réglés</StatHelpText>
                </Stat>

                <Stat
                  p={6}
                  bgGradient="linear-gradient(135deg, #FF9800 0%, #FFD41A 100%)"
                  borderRadius="xl"
                  color="white"
                  boxShadow="0 8px 32px rgba(255, 152, 0, 0.3)"
                >
                  <StatLabel fontSize="sm" opacity={0.9}>Votes reçus</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold">{userStats.totalVotes}</StatNumber>
                  <StatHelpText color="whiteAlpha.800" mb={0}>Sur vos signalements</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Account Info Card */}
          <Card 
            bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
            backdropFilter="blur(10px)"
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor="rgba(90, 110, 255, 0.2)"
          >
            <CardHeader>
              <Heading size="md" color="white">Informations du compte</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" p={4} bg="rgba(42, 49, 89, 0.5)" borderRadius="lg" border="1px" borderColor="rgba(90, 110, 255, 0.2)">
                  <Box>
                    <Text fontWeight="600" color="white">Identifiant unique</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">{user.id}</Text>
                  </Box>
                </Flex>
                <Flex justify="space-between" p={4} bg="rgba(42, 49, 89, 0.5)" borderRadius="lg" border="1px" borderColor="rgba(90, 110, 255, 0.2)">
                  <Box>
                    <Text fontWeight="600" color="white">Dernière mise à jour</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">{formatDate(user.updatedAt)}</Text>
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
