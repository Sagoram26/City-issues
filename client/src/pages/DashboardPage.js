// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/DashboardPage.js
// Tableau de bord de l'utilisateur connecté. Affiche ses propres
// signalements avec stats (total, ouverts, en cours, résolus).
// Bouton pour créer un nouveau signalement.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import IssueCard from '../components/IssueCard';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  // --- States ---
  const [issues, setIssues] = useState([]);     // Signalements de l'utilisateur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({          // Statistiques calculées
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // --- Chargement des signalements de l'utilisateur ---
  useEffect(() => {
    const fetchUserIssues = async () => {
      try {
        setLoading(true);
        // Appel API: GET /users/:id/issues
        const response = await api.get(`/users/${user.id}/issues`);
        const userIssues = response.data.issues;
        
        setIssues(userIssues);
        
        // Calcul des statistiques localement
        setStats({
          total: userIssues.length,
          open: userIssues.filter(i => i.status === 'open').length,
          inProgress: userIssues.filter(i => i.status === 'in_progress').length,
          resolved: userIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length
        });
        
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement de vos signalements');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserIssues();
    }
  }, [user]);

  // État de chargement
  if (loading) {
    return (
      <Center minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="whiteAlpha.700">Chargement de vos signalements...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)" py={8}>
      <Container maxW="1200px">
        <VStack spacing={6} align="stretch">
          {/* --- En-tête avec bouton Signaler --- */}
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Heading 
                size="lg" 
                bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                bgClip="text"
              >
                Mon tableau de bord
              </Heading>
              <Text color="whiteAlpha.700">Bonjour {user?.username}, voici vos signalements</Text>
            </Box>
            <Button
              as={RouterLink}
              to="/report"
              bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
              color="white"
              leftIcon={<AddIcon />}
              size="lg"
              borderRadius="xl"
              fontWeight="600"
              _hover={{
                bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)",
                boxShadow: "0 8px 32px rgba(90, 110, 255, 0.4)"
              }}
            >
              Nouveau signalement
            </Button>
          </HStack>

          {/* Error Alert */}
          {error && (
            <Alert 
              status="error" 
              borderRadius="lg"
              bg="rgba(230, 0, 0, 0.1)"
              borderColor="rgba(230, 0, 0, 0.3)"
            >
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="white">
                    {stats.total}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.600">Total</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="#5A6EFF">
                    {stats.open}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.600">Ouverts</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="#FF9800">
                    {stats.inProgress}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.600">En cours</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="#00B390">
                    {stats.resolved}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.600">Résolus</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Issues List */}
          {issues.length === 0 ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Text fontSize="6xl">📭</Text>
                <Heading size="md" color="white">Aucun signalement</Heading>
                <Text color="whiteAlpha.600">Vous n'avez pas encore fait de signalement.</Text>
                <Button
                  as={RouterLink}
                  to="/report"
                  bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
                  color="white"
                  size="lg"
                  borderRadius="xl"
                  _hover={{
                    bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)",
                    boxShadow: "0 8px 32px rgba(90, 110, 255, 0.4)"
                  }}
                >
                  Faire mon premier signalement
                </Button>
              </VStack>
            </Center>
          ) : (
            <Box>
              <Heading size="md" mb={4} color="white">Vos signalements</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {issues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default DashboardPage;
