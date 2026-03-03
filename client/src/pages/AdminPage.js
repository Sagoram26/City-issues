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
  useColorModeValue,
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
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issues');
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    totalUsers: 0,
    admins: 0
  });
  const [deleteId, setDeleteId] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const issuesResponse = await issueService.getIssues({ limit: 100 });
        setIssues(issuesResponse.issues);
        
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data.users);
        
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

  const confirmDelete = (issueId) => {
    setDeleteId(issueId);
    onOpen();
  };

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
      <Center minH="calc(100vh - 64px)" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Chargement des données...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50" py={8}>
      <Container maxW="1400px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack spacing={2} mb={1}>
              <Heading size="lg" color="gray.800">Administration</Heading>
              <Badge colorScheme="purple" fontSize="sm">Pro</Badge>
            </HStack>
            <Text color="gray.600">Gérez les signalements et les utilisateurs</Text>
          </Box>

          {/* Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="gray.700">
                    {stats.totalIssues}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">Signalements</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="orange.500">
                    {stats.openIssues}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">À traiter</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                    {stats.totalUsers}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">Utilisateurs</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
                    {stats.admins}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.500">Admins</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tabs */}
          <ButtonGroup isAttached variant="outline" size="md">
            <Button
              onClick={() => setActiveTab('issues')}
              colorScheme={activeTab === 'issues' ? 'blue' : 'gray'}
              variant={activeTab === 'issues' ? 'solid' : 'outline'}
            >
              📋 Signalements ({issues.length})
            </Button>
            <Button
              onClick={() => setActiveTab('users')}
              colorScheme={activeTab === 'users' ? 'blue' : 'gray'}
              variant={activeTab === 'users' ? 'solid' : 'outline'}
            >
              👥 Utilisateurs ({users.length})
            </Button>
          </ButtonGroup>

          {/* Issues Table */}
          {activeTab === 'issues' && (
            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Liste des signalements</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Titre</Th>
                        <Th>Auteur</Th>
                        <Th>Date</Th>
                        <Th isNumeric>Votes</Th>
                        <Th>Statut</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {issues.map(issue => (
                        <Tr key={issue.id}>
                          <Td>
                            <Link
                              as={RouterLink}
                              to={`/issues/${issue.id}`}
                              color="blue.600"
                              fontWeight="500"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {issue.title.substring(0, 40)}
                              {issue.title.length > 40 ? '...' : ''}
                            </Link>
                          </Td>
                          <Td>{issue.reporter?.username || 'N/A'}</Td>
                          <Td>{formatDate(issue.createdAt)}</Td>
                          <Td isNumeric>
                            <Badge colorScheme="blue">{issue.voteCount}</Badge>
                          </Td>
                          <Td>
                            <Select
                              value={issue.status}
                              onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                              size="sm"
                              w="130px"
                              borderRadius="md"
                            >
                              {Object.entries(statusConfig).map(([value, config]) => (
                                <option key={value} value={value}>{config.label}</option>
                              ))}
                            </Select>
                          </Td>
                          <Td>
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
                    <Text color="gray.500">Aucun signalement</Text>
                  </Center>
                )}
              </CardBody>
            </Card>
          )}

          {/* Users Table */}
          {activeTab === 'users' && (
            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Liste des utilisateurs</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Nom d'utilisateur</Th>
                        <Th>Email</Th>
                        <Th>Inscrit le</Th>
                        <Th>Rôle</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map(user => (
                        <Tr key={user.id}>
                          <Td fontWeight="500">{user.username}</Td>
                          <Td>{user.email}</Td>
                          <Td>{formatDate(user.createdAt)}</Td>
                          <Td>
                            <Select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              size="sm"
                              w="120px"
                              borderRadius="md"
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
                    <Text color="gray.500">Aucun utilisateur</Text>
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
