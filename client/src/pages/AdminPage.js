// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/AdminPage.js
// Page d'administration (accès protégé aux admins). Deux onglets:
// - "Issues": liste tous les signalements, permet de changer le
//   statut ou supprimer (avec confirmation)
// - "Users": liste tous les utilisateurs, permet de changer le rôle
// Affiche des stats globales (total issues, ouverts, users, admins)
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
  CardHeader,
  Button,
  ButtonGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Center,
  Link,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import api from '../services/api';
import issueService from '../services/issueService';

const AdminPage = () => {
  // --- States ---
  const [issues, setIssues] = useState([]);     // Liste de tous les signalements
  const [users, setUsers] = useState([]);       // Liste de tous les utilisateurs
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issues'); // Onglet actif: 'issues' ou 'users'
  const [stats, setStats] = useState({          // Statistiques globales
    totalIssues: 0,
    openIssues: 0,
    totalUsers: 0,
    admins: 0
  });
  const [deleteId, setDeleteId] = useState(null); // ID du signalement à supprimer

  const { isOpen, onOpen, onClose } = useDisclosure(); // Dialog de confirmation
  const cancelRef = React.useRef();
  const toast = useToast();

  // --- Chargement initial des données ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupère tous les signalements
        const issuesResponse = await issueService.getIssues({ limit: 100 });
        setIssues(issuesResponse.issues);
        
        // Récupère tous les utilisateurs (route admin)
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data.users);
        
        // Calcule les statistiques
        setStats({
          totalIssues: issuesResponse.pagination.total,
          openIssues: issuesResponse.issues.filter(i => i.status === 'open').length,
          totalUsers: usersResponse.data.pagination.total,
          admins: usersResponse.data.users.filter(u => u.role === 'admin').length
        });
        
      } catch (err) {
        console.error('Error fetching admin data:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // --- Changement de statut d'un signalement ---
  // Émet un événement WebSocket 'issue:status' côté backend
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await issueService.updateIssueStatus(issueId, newStatus);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
      toast({
        title: 'Statut mis à jour',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // --- Changement de rôle d'un utilisateur ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast({
        title: 'Rôle mis à jour',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le rôle',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Ouvre le dialog de confirmation de suppression
  const confirmDelete = (issueId) => {
    setDeleteId(issueId);
    onOpen();
  };

  // --- Suppression d'un signalement ---
  // Émet un événement WebSocket 'issue:delete' côté backend
  const handleDeleteIssue = async () => {
    try {
      await issueService.deleteIssue(deleteId);
      setIssues(prev => prev.filter(issue => issue.id !== deleteId));
      setStats(prev => ({
        ...prev,
        totalIssues: prev.totalIssues - 1
      }));
      toast({
        title: 'Signalement supprimé',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le signalement',
        status: 'error',
        duration: 3000,
      });
    } finally {
      onClose();
      setDeleteId(null);
    }
  };

  const statusConfig = {
    open: { label: 'Ouvert', colorScheme: 'blue' },
    in_progress: { label: 'En cours', colorScheme: 'orange' },
    resolved: { label: 'Résolu', colorScheme: 'green' },
    closed: { label: 'Fermé', colorScheme: 'gray' },
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Center minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="whiteAlpha.700">Chargement des données...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)" py={8}>
      <Container maxW="1400px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack spacing={2} mb={1}>
              <Heading 
                size="lg" 
                bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                bgClip="text"
              >
                Administration
              </Heading>
              <Badge colorScheme="purple" fontSize="sm">Pro</Badge>
            </HStack>
            <Text color="whiteAlpha.700">Gérez les signalements et les utilisateurs</Text>
          </Box>

          {/* Stats */}
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
                    {stats.totalIssues}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.700">Signalements</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(255, 152, 0, 0.3)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber 
                    fontSize="3xl" 
                    fontWeight="bold" 
                    bgGradient="linear(to-r, #FF9800, #F59E0B)"
                    bgClip="text"
                  >
                    {stats.openIssues}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.700">À traiter</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(0, 184, 245, 0.3)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber 
                    fontSize="3xl" 
                    fontWeight="bold" 
                    bgGradient="linear(to-r, #00B8F5, #5A6EFF)"
                    bgClip="text"
                  >
                    {stats.totalUsers}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.700">Utilisateurs</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(139, 92, 246, 0.3)"
            >
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber 
                    fontSize="3xl" 
                    fontWeight="bold" 
                    bgGradient="linear(to-r, #8B5CF6, #A855F7)"
                    bgClip="text"
                  >
                    {stats.admins}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="whiteAlpha.700">Admins</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tabs */}
          <ButtonGroup isAttached variant="outline" size="md">
            <Button
              onClick={() => setActiveTab('issues')}
              bg={activeTab === 'issues' ? 'linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)' : 'transparent'}
              color="white"
              borderColor="rgba(90, 110, 255, 0.5)"
              _hover={{ bg: activeTab === 'issues' ? 'linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)' : 'rgba(90, 110, 255, 0.2)' }}
            >
              📋 Signalements ({issues.length})
            </Button>
            <Button
              onClick={() => setActiveTab('users')}
              bg={activeTab === 'users' ? 'linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)' : 'transparent'}
              color="white"
              borderColor="rgba(90, 110, 255, 0.5)"
              _hover={{ bg: activeTab === 'users' ? 'linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)' : 'rgba(90, 110, 255, 0.2)' }}
            >
              👥 Utilisateurs ({users.length})
            </Button>
          </ButtonGroup>

          {/* Issues Table */}
          {activeTab === 'issues' && (
            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardHeader>
                <Heading size="md" color="white">Liste des signalements</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Titre</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Auteur</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Date</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)" isNumeric>Votes</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Statut</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {issues.map(issue => (
                        <Tr key={issue.id} _hover={{ bg: 'rgba(90, 110, 255, 0.1)' }}>
                          <Td borderColor="rgba(90, 110, 255, 0.1)">
                            <Link
                              as={RouterLink}
                              to={`/issues/${issue.id}`}
                              color="#00B8F5"
                              fontWeight="500"
                              _hover={{ textDecoration: 'underline', color: '#5A6EFF' }}
                            >
                              {issue.title.substring(0, 40)}
                              {issue.title.length > 40 ? '...' : ''}
                            </Link>
                          </Td>
                          <Td color="whiteAlpha.800" borderColor="rgba(90, 110, 255, 0.1)">{issue.reporter?.username || 'N/A'}</Td>
                          <Td color="whiteAlpha.700" borderColor="rgba(90, 110, 255, 0.1)">{formatDate(issue.createdAt)}</Td>
                          <Td isNumeric borderColor="rgba(90, 110, 255, 0.1)">
                            <Badge colorScheme="blue">{issue.voteCount}</Badge>
                          </Td>
                          <Td borderColor="rgba(90, 110, 255, 0.1)">
                            <Select
                              value={issue.status}
                              onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                              size="sm"
                              w="130px"
                              borderRadius="md"
                              bg="rgba(42, 49, 89, 0.9)"
                              color="white"
                              borderColor="rgba(90, 110, 255, 0.5)"
                              _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                              sx={{
                                '& option': {
                                  bg: '#1a1f2e',
                                  color: 'white',
                                }
                              }}
                            >
                              {Object.entries(statusConfig).map(([value, config]) => (
                                <option key={value} value={value}>{config.label}</option>
                              ))}
                            </Select>
                          </Td>
                          <Td borderColor="rgba(90, 110, 255, 0.1)">
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              leftIcon={<DeleteIcon />}
                              onClick={() => confirmDelete(issue.id)}
                            >
                              Supprimer
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                
                {issues.length === 0 && (
                  <Center py={8}>
                    <Text color="whiteAlpha.600">Aucun signalement</Text>
                  </Center>
                )}
              </CardBody>
            </Card>
          )}

          {/* Users Table */}
          {activeTab === 'users' && (
            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardHeader>
                <Heading size="md" color="white">Liste des utilisateurs</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Nom d'utilisateur</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Email</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Inscrit le</Th>
                        <Th color="whiteAlpha.600" borderColor="rgba(90, 110, 255, 0.2)">Rôle</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map(user => (
                        <Tr key={user.id} _hover={{ bg: 'rgba(90, 110, 255, 0.1)' }}>
                          <Td fontWeight="500" color="white" borderColor="rgba(90, 110, 255, 0.1)">{user.username}</Td>
                          <Td color="whiteAlpha.800" borderColor="rgba(90, 110, 255, 0.1)">{user.email}</Td>
                          <Td color="whiteAlpha.700" borderColor="rgba(90, 110, 255, 0.1)">{formatDate(user.createdAt)}</Td>
                          <Td borderColor="rgba(90, 110, 255, 0.1)">
                            <Select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              size="sm"
                              w="120px"
                              borderRadius="md"
                              bg="rgba(42, 49, 89, 0.9)"
                              color="white"
                              borderColor="rgba(90, 110, 255, 0.5)"
                              _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                              sx={{
                                '& option': {
                                  bg: '#1a1f2e',
                                  color: 'white',
                                }
                              }}
                            >
                              <option value="citizen">Citoyen</option>
                              <option value="admin">Admin</option>
                            </Select>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                
                {users.length === 0 && (
                  <Center py={8}>
                    <Text color="whiteAlpha.600">Aucun utilisateur</Text>
                  </Center>
                )}
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)">
          <AlertDialogContent 
            borderRadius="xl" 
            bg="linear-gradient(135deg, #1a1f2e 0%, #0F1419 100%)"
            border="1px solid rgba(90, 110, 255, 0.3)"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
              Supprimer le signalement
            </AlertDialogHeader>

            <AlertDialogBody color="whiteAlpha.800">
              Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={onClose} 
                borderRadius="lg"
                variant="ghost"
                color="whiteAlpha.800"
                _hover={{ bg: 'rgba(90, 110, 255, 0.2)' }}
              >
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDeleteIssue} ml={3} borderRadius="lg">
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminPage;
