import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  ButtonGroup,
  SimpleGrid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import IssueMap from '../components/IssueMap';
import IssueCard from '../components/IssueCard';
import { useSocket } from '../contexts/SocketContext';
import issueService from '../services/issueService';

const HomePage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('map');
  
  const { socket } = useSocket();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      
      const data = await issueService.getIssues(params);
      setIssues(data.issues);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des signalements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewIssue = (newIssue) => {
      setIssues(prev => [newIssue, ...prev]);
    };

    const handleVoteUpdate = ({ issueId, voteCount }) => {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, voteCount } : issue
      ));
    };

    const handleStatusUpdate = ({ issueId, status }) => {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status } : issue
      ));
    };

    const handleDeleteIssue = ({ issueId }) => {
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
    };

    socket.on('issue:new', handleNewIssue);
    socket.on('issue:vote', handleVoteUpdate);
    socket.on('issue:status', handleStatusUpdate);
    socket.on('issue:delete', handleDeleteIssue);

    return () => {
      socket.off('issue:new', handleNewIssue);
      socket.off('issue:vote', handleVoteUpdate);
      socket.off('issue:status', handleStatusUpdate);
      socket.off('issue:delete', handleDeleteIssue);
    };
  }, [socket]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'open', label: 'Ouvert' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'resolved', label: 'Résolu' },
    { value: 'closed', label: 'Fermé' },
  ];

  const categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'road', label: 'Voirie' },
    { value: 'lighting', label: 'Éclairage' },
    { value: 'waste', label: 'Déchets' },
    { value: 'greenery', label: 'Espaces verts' },
    { value: 'safety', label: 'Sécurité' },
    { value: 'noise', label: 'Bruit' },
    { value: 'other', label: 'Autre' },
  ];

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50">
      {/* Hero Section */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        py={12}
        px={4}
      >
        <Container maxW="1400px">
          <VStack spacing={4} textAlign="center">
            <Heading 
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="bold"
              color="white"
            >
              Signalements de votre ville
            </Heading>
            <Text 
              fontSize={{ base: 'md', md: 'lg' }}
              color="whiteAlpha.900"
              maxW="600px"
            >
              Consultez, signalez et votez pour les problèmes de votre quartier. 
              Ensemble, améliorons notre cadre de vie.
            </Text>
            <Badge 
              colorScheme="green" 
              fontSize="sm" 
              px={3} 
              py={1} 
              borderRadius="full"
            >
              {issues.length} signalement(s) actif(s)
            </Badge>
          </VStack>
        </Container>
      </Box>

      <Container maxW="1400px" py={6} px={{ base: 4, md: 6 }}>
        {/* Filter Bar */}
        <Box
          as="form"
          onSubmit={handleSearchSubmit}
          bg={cardBg}
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          p={4}
          mb={6}
        >
          <Flex 
            direction={{ base: 'column', lg: 'row' }}
            gap={4}
            align={{ base: 'stretch', lg: 'center' }}
            justify="space-between"
          >
            <HStack spacing={4} flex={1} flexWrap="wrap">
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                minW="160px"
                borderRadius="lg"
                size="md"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>

              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                minW="180px"
                borderRadius="lg"
                size="md"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>

              <InputGroup maxW={{ base: '100%', md: '300px' }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} color="gray.400" />
                </InputLeftElement>
                <Input
                  name="search"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  borderRadius="lg"
                />
              </InputGroup>

              <Button type="submit" colorScheme="blue" borderRadius="lg">
                Filtrer
              </Button>
            </HStack>

            <ButtonGroup isAttached variant="outline">
              <Button
                onClick={() => setViewMode('map')}
                colorScheme={viewMode === 'map' ? 'blue' : 'gray'}
                variant={viewMode === 'map' ? 'solid' : 'outline'}
                leftIcon={<Text>🗺️</Text>}
              >
                Carte
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                leftIcon={<Text>📋</Text>}
              >
                Liste
              </Button>
            </ButtonGroup>
          </Flex>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert status="error" borderRadius="lg" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="gray.500">Chargement des signalements...</Text>
            </VStack>
          </Center>
        ) : (
          <>
            {viewMode === 'map' ? (
              <Box 
                borderRadius="xl" 
                overflow="hidden" 
                shadow="md"
                border="1px"
                borderColor={borderColor}
              >
                <IssueMap issues={issues} height="600px" />
              </Box>
            ) : (
              <>
                {issues.length === 0 ? (
                  <Center py={20}>
                    <VStack spacing={4}>
                      <Text fontSize="6xl">🔍</Text>
                      <Heading size="md" color="gray.600">
                        Aucun signalement trouvé
                      </Heading>
                      <Text color="gray.500">
                        Aucun signalement ne correspond à vos critères de recherche.
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {issues.map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </SimpleGrid>
                )}
              </>
            )}
            
            <Center mt={6}>
              <Text color="gray.500" fontSize="sm">
                {issues.length} signalement(s) trouvé(s)
              </Text>
            </Center>
          </>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
