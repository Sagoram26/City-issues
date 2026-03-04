// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/IssueDetailPage.js
// Page de détail d'un signalement. Affiche image, description, carte,
// auteur, date. Permet de voter et (admin) de changer le statut ou
// supprimer. Écoute Socket.IO pour MAJ temps réel du voteCount/status.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Button,
  Badge,
  Image,
  Select,
  Flex,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Icon,
  Avatar,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';
import IssueMap from '../components/IssueMap';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import issueService from '../services/issueService';

const IssueDetailPage = () => {
  // --- Récupération de l'ID depuis l'URL ---
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { socket } = useSocket();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Pour le dialog de suppression
  const cancelRef = React.useRef();
  
  // --- States ---
  const [issue, setIssue] = useState(null);           // Détail du signalement
  const [loading, setLoading] = useState(true);       // Chargement en cours
  const [error, setError] = useState(null);           // Erreur
  const [voting, setVoting] = useState(false);        // Vote en cours
  const [statusUpdating, setStatusUpdating] = useState(false); // MAJ statut en cours

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Configuration des statuts
  const statusConfig = {
    open: { label: 'Ouvert', colorScheme: 'blue' },
    in_progress: { label: 'En cours', colorScheme: 'orange' },
    resolved: { label: 'Résolu', colorScheme: 'green' },
    closed: { label: 'Fermé', colorScheme: 'gray' },
  };

  // Configuration des catégories
  const categoryConfig = {
    road: { label: 'Voirie', icon: '🛣️' },
    lighting: { label: 'Éclairage', icon: '💡' },
    waste: { label: 'Déchets', icon: '🗑️' },
    greenery: { label: 'Espaces verts', icon: '🌳' },
    safety: { label: 'Sécurité', icon: '⚠️' },
    noise: { label: 'Bruit', icon: '🔊' },
    other: { label: 'Autre', icon: '📌' },
  };

  const SERVER_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  // --- Chargement du signalement ---
  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const data = await issueService.getIssueById(id);
        setIssue(data);
        setError(null);
      } catch (err) {
        setError('Signalement non trouvé');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  // --- ÉCOUTE SOCKET.IO POUR MAJ TEMPS RÉEL ---
  useEffect(() => {
    if (!socket || !issue) return;

    // Mise à jour du nombre de votes
    const handleVoteUpdate = ({ issueId, voteCount }) => {
      if (issueId === id) {
        setIssue(prev => ({ ...prev, voteCount }));
      }
    };

    // Mise à jour du statut
    const handleStatusUpdate = ({ issueId, status }) => {
      if (issueId === id) {
        setIssue(prev => ({ ...prev, status }));
      }
    };

    socket.on('issue:vote', handleVoteUpdate);
    socket.on('issue:status', handleStatusUpdate);

    return () => {
      socket.off('issue:vote', handleVoteUpdate);
      socket.off('issue:status', handleStatusUpdate);
    };
  }, [socket, id, issue]);

  // --- Fonction de vote ---
  const handleVote = async () => {
    // Redirige vers login si non connecté
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/issues/${id}` } } });
      return;
    }

    try {
      setVoting(true);
      const response = await issueService.voteIssue(id);
      setIssue(prev => ({
        ...prev,
        voteCount: response.voteCount,
        userHasVoted: true
      }));
      toast({
        title: 'Vote enregistré !',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Erreur lors du vote',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setVoting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await issueService.updateIssueStatus(id, newStatus);
      setIssue(prev => ({ ...prev, status: newStatus }));
      toast({
        title: 'Statut mis à jour',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Erreur lors de la mise à jour',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await issueService.deleteIssue(id);
      toast({
        title: 'Signalement supprimé',
        status: 'success',
        duration: 2000,
      });
      navigate('/');
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Erreur lors de la suppression',
        status: 'error',
        duration: 3000,
      });
    }
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Center minH="calc(100vh - 64px)" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Chargement du signalement...</Text>
        </VStack>
      </Center>
    );
  }

  if (error || !issue) {
    return (
      <Box minH="calc(100vh - 64px)" bg="gray.50" py={8}>
        <Container maxW="800px">
          <Alert status="error" borderRadius="lg" mb={4}>
            <AlertIcon />
            {error || 'Signalement non trouvé'}
          </Alert>
          <Button
            as={RouterLink}
            to="/"
            leftIcon={<ArrowBackIcon />}
            colorScheme="blue"
          >
            Retour à l'accueil
          </Button>
        </Container>
      </Box>
    );
  }

  const status = statusConfig[issue.status] || statusConfig.open;
  const category = categoryConfig[issue.category] || categoryConfig.other;

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50" py={8}>
      <Container maxW="900px">
        <VStack spacing={6} align="stretch">
          {/* Back Button */}
          <Button
            as={RouterLink}
            to="/"
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            alignSelf="flex-start"
            color="gray.600"
          >
            Retour à la carte
          </Button>

          {/* Photo */}
          {issue.photoUrl && (
            <Box borderRadius="xl" overflow="hidden" shadow="md">
              <Image
                src={`${SERVER_URL}${issue.photoUrl}`}
                alt={issue.title}
                w="100%"
                maxH="400px"
                objectFit="cover"
              />
            </Box>
          )}

          {/* Main Card */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
            <CardBody p={6}>
              {/* Header */}
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" flexWrap="wrap" gap={2}>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={status.colorScheme}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      {status.label}
                    </Badge>
                    <Badge
                      bg="gray.100"
                      color="gray.700"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      {category.icon} {category.label}
                    </Badge>
                  </HStack>
                  
                  <HStack spacing={1} color="gray.500" fontSize="sm">
                    <Icon as={TimeIcon} />
                    <Text>{formatDate(issue.createdAt)}</Text>
                  </HStack>
                </HStack>

                <Heading size="lg" color="gray.800">
                  {issue.title}
                </Heading>

                {/* Reporter Info */}
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={issue.reporter?.username}
                    bg="blue.500"
                  />
                  <Box>
                    <Text fontSize="sm" color="gray.500">Signalé par</Text>
                    <Text fontWeight="600" color="gray.700">
                      {issue.reporter?.username || 'Anonyme'}
                    </Text>
                  </Box>
                </HStack>

                {issue.address && (
                  <HStack spacing={2} color="gray.600">
                    <Text>📍</Text>
                    <Text>{issue.address}</Text>
                  </HStack>
                )}

                <Divider />

                {/* Description */}
                <Box>
                  <Heading size="sm" mb={2} color="gray.700">Description</Heading>
                  <Text color="gray.600" whiteSpace="pre-wrap">
                    {issue.description}
                  </Text>
                </Box>

                <Divider />

                {/* Actions */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                  <Button
                    onClick={handleVote}
                    colorScheme={issue.userHasVoted ? 'green' : 'blue'}
                    variant={issue.userHasVoted ? 'solid' : 'solid'}
                    isDisabled={voting || issue.userHasVoted}
                    isLoading={voting}
                    size="lg"
                    borderRadius="xl"
                    leftIcon={<Text>👍</Text>}
                  >
                    {issue.userHasVoted ? 'Voté' : 'Voter'} ({issue.voteCount})
                  </Button>

                  {isAdmin && (
                    <HStack spacing={3}>
                      <Select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        isDisabled={statusUpdating}
                        w="150px"
                        borderRadius="lg"
                      >
                        {Object.entries(statusConfig).map(([value, config]) => (
                          <option key={value} value={value}>{config.label}</option>
                        ))}
                      </Select>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        leftIcon={<DeleteIcon />}
                        onClick={onOpen}
                        borderRadius="lg"
                      >
                        Supprimer
                      </Button>
                    </HStack>
                  )}
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Map Card */}
          <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor} overflow="hidden">
            <CardHeader>
              <Heading size="md">📍 Localisation</Heading>
            </CardHeader>
            <CardBody p={0}>
              <IssueMap
                issues={[issue]}
                center={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
                zoom={16}
                height="300px"
                showPopups={false}
              />
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer le signalement
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="lg">
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="lg">
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default IssueDetailPage;
