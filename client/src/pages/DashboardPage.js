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
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchUserIssues = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${user.id}/issues`);
        const userIssues = response.data.issues;
        
        setIssues(userIssues);
        
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

  if (loading) {
    return (
      <Center minH="calc(100vh - 64px)" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Chargement de vos signalements...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.800">Mon tableau de bord</Heading>
              <Text color="gray.600">Bonjour {user?.username}, voici vos signalements</Text>
            </Box>
            <Button
              as={RouterLink}
              to="/report"
              colorScheme="blue"
              leftIcon={<AddIcon />}
              size="lg"
              borderRadius="xl"
            >
              Nouveau signalement
            </Button>
          </HStack>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="gray.700">
                    {stats.total}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">Total</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                    {stats.open}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">Ouverts</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="orange.500">
                    {stats.inProgress}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">En cours</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                    {stats.resolved}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">Résolus</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Issues List */}
          {issues.length === 0 ? (
            <Center py={16}>
              <VStack spacing={4}>
                <Text fontSize="6xl">📭</Text>
                <Heading size="md" color="gray.600">Aucun signalement</Heading>
                <Text color="gray.500">Vous n'avez pas encore fait de signalement.</Text>
                <Button
                  as={RouterLink}
                  to="/report"
                  colorScheme="blue"
                  size="lg"
                  borderRadius="xl"
                >
                  Faire mon premier signalement
                </Button>
              </VStack>
            </Center>
          ) : (
            <Box>
              <Heading size="md" mb={4} color="gray.700">Vos signalements</Heading>
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
