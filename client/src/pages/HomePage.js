// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/HomePage.js
// Page d'accueil. Affiche la carte des signalements ou une grille
// de cartes. Inclut filtres (statut, catégorie, recherche) et
// écoute les événements Socket.IO pour MAJ temps réel.
// ═══════════════════════════════════════════════════════════════════════════

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
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import IssueMap from '../components/IssueMap';
import IssueCard from '../components/IssueCard';
import { useSocket } from '../contexts/SocketContext';
import issueService from '../services/issueService';

const HomePage = () => {
  // --- States ---
  const [issues, setIssues] = useState([]);           // Liste des signalements
  const [loading, setLoading] = useState(true);       // Chargement en cours
  const [error, setError] = useState(null);           // Message d'erreur
  const [filters, setFilters] = useState({            // Filtres actifs
    status: '',
    category: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('map');    // 'map' ou 'cards'
  const [newIssueIds, setNewIssueIds] = useState(new Set()); // IDs des signalements "NEW"
  
  const { socket } = useSocket();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // --- Récupération des signalements depuis l'API ---
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      // Construction des paramètres de requête
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

  // Charger les signalements au montage et à chaque changement de filtre
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // --- ÉCOUTE DES ÉVÉNEMENTS SOCKET.IO (TEMPS RÉEL) ---
  useEffect(() => {
    if (!socket) return;

    // Nouveau signalement créé par un autre utilisateur
    const handleNewIssue = (newIssue) => {
      setIssues(prev => [newIssue, ...prev]);
      setNewIssueIds(prev => new Set([...prev, newIssue.id]));
      
      // Toast notification
      toast({
        title: '🆕 Nouveau signalement!',
        description: `"${newIssue.title}" vient d'être signalé`,
        status: 'info',
        duration: 5,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    // Mise à jour du nombre de votes
    const handleVoteUpdate = ({ issueId, voteCount }) => {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, voteCount } : issue
      ));
      
      toast({
        title: '👍 Vote reçu!',
        description: `Un nouveau vote a été ajouté`,
        status: 'success',
        duration: 3,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    // Changement de statut
    const handleStatusUpdate = ({ issueId, status }) => {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status } : issue
      ));
      
      const statusLabels = {
        open: 'Ouvert',
        in_progress: 'En cours',
        resolved: 'Résolu',
        closed: 'Fermé'
      };
      
      toast({
        title: '📋 Statut mis à jour',
        description: `Le signalement est maintenant "${statusLabels[status]}"`,
        status: 'info',
        duration: 3,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    // Suppression d'un signalement
    const handleDeleteIssue = ({ issueId }) => {
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      
      toast({
        title: '🗑️ Signalement supprimé',
        description: `Le signalement a été supprimé`,
        status: 'warning',
        duration: 3,
        isClosable: true,
        position: 'bottom-right',
      });
    };

    // Abonnement aux événements
    socket.on('issue:new', handleNewIssue);
    socket.on('issue:vote', handleVoteUpdate);
    socket.on('issue:status', handleStatusUpdate);
    socket.on('issue:delete', handleDeleteIssue);

    // Nettoyage à la destruction du composant
    return () => {
      socket.off('issue:new', handleNewIssue);
      socket.off('issue:vote', handleVoteUpdate);
      socket.off('issue:status', handleStatusUpdate);
      socket.off('issue:delete', handleDeleteIssue);
    };
  }, [socket, toast]);

  // --- Gestion des filtres ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setFilters({
      status: '',
      category: '',
      search: ''
    });
  };

  // Options pour les selects de filtre
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
    <Box minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)">
      {/* --- Section Hero avec gradient métallisé premium --- */}
      <Box 
        bg="linear-gradient(135deg, #1a1f2e 0%, #2A3159 50%, #1a1f2e 100%)"
        borderBottom="2px solid"
        borderColor="rgba(90, 110, 255, 0.3)"
        py={16}
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
            <HStack spacing={2}>
              <Badge 
                colorScheme="green" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
              >
                {issues.length} signalement(s) actif(s)
              </Badge>
              {newIssueIds.size > 0 && (
                <Badge 
                  bgGradient="linear-gradient(135deg, #FF9800 0%, #FFD41A 100%)"
                  fontSize="sm" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  boxShadow="0 4px 16px rgba(255, 216, 26, 0.3)"
                  className="blink-notification"
                >
                  🆕 {newIssueIds.size} nouveau(x)
                </Badge>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="1400px" py={6} px={{ base: 4, md: 6 }}>
        {/* Filter Bar */}
        <Box
          as="form"
          onSubmit={handleSearchSubmit}
          bg="linear-gradient(135deg, rgba(42, 49, 89, 0.8) 0%, rgba(35, 45, 63, 0.8) 100%)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          shadow="lg"
          border="1px"
          borderColor="rgba(90, 110, 255, 0.3)"
          p={6}
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
                bg="rgba(42, 49, 89, 0.9)"
                color="white"
                fontWeight="600"
                border="2px"
                borderColor="rgba(90, 110, 255, 0.5)"
                _hover={{ borderColor: "rgba(90, 110, 255, 0.8)", bg: "rgba(42, 49, 89, 1)" }}
                _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 3px rgba(90, 110, 255, 0.3)" }}
                sx={{
                  '& option': {
                    bg: '#1a1f2e',
                    color: 'white',
                    fontWeight: '500',
                    _hover: { bg: '#2A3159' }
                  }
                }}
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
                bg="rgba(42, 49, 89, 0.9)"
                color="white"
                fontWeight="600"
                border="2px"
                borderColor="rgba(90, 110, 255, 0.5)"
                _hover={{ borderColor: "rgba(90, 110, 255, 0.8)", bg: "rgba(42, 49, 89, 1)" }}
                _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 3px rgba(90, 110, 255, 0.3)" }}
                sx={{
                  '& option': {
                    bg: '#1a1f2e',
                    color: 'white',
                    fontWeight: '500',
                    _hover: { bg: '#2A3159' }
                  }
                }}
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

              <Button 
                type="submit" 
                bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
                color="white"
                fontWeight="600"
                borderRadius="lg"
                _hover={{
                  bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)",
                  boxShadow: "0 8px 32px rgba(90, 110, 255, 0.4)"
                }}
              >
                Filtrer
              </Button>

              <Button
                type="button"
                onClick={handleResetFilters}
                variant="outline"
                color="whiteAlpha.800"
                borderColor="rgba(90, 110, 255, 0.5)"
                fontWeight="600"
                borderRadius="lg"
                _hover={{
                  bg: "rgba(90, 110, 255, 0.2)",
                  borderColor: "rgba(90, 110, 255, 0.8)"
                }}
              >
                ↻ Réinitialiser
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
          <Alert 
            status="error" 
            borderRadius="lg" 
            mb={6}
            bg="rgba(230, 0, 0, 0.1)"
            borderColor="rgba(230, 0, 0, 0.3)"
          >
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
                      <IssueCard 
                        key={issue.id} 
                        issue={issue} 
                        isNew={newIssueIds.has(issue.id)}
                        onNewSeen={() => setNewIssueIds(prev => {
                          const updated = new Set(prev);
                          updated.delete(issue.id);
                          return updated;
                        })}
                      />
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