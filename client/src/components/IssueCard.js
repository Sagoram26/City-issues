// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: components/IssueCard.js
// Carte d'aperçu d'un signalement. Affiche la photo, le titre,
// le statut, la catégorie et le nombre de votes. Cliquable pour
// accéder au détail.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';

const IssueCard = ({ issue }) => {
  // --- Configuration des couleurs par statut ---
  const statusConfig = {
    open: { label: 'Ouvert', colorScheme: 'blue' },
    in_progress: { label: 'En cours', colorScheme: 'orange' },
    resolved: { label: 'Résolu', colorScheme: 'green' },
    closed: { label: 'Fermé', colorScheme: 'gray' },
  };

  // --- Labels et icônes par catégorie ---
  const categoryLabels = {
    road: 'Voirie',
    lighting: 'Éclairage',
    waste: 'Déchets',
    greenery: 'Espaces verts',
    safety: 'Sécurité',
    noise: 'Bruit',
    other: 'Autre',
  };

  const categoryIcons = {
    road: '🛣️',
    lighting: '💡',
    waste: '🗑️',
    greenery: '🌳',
    safety: '⚠️',
    noise: '🔊',
    other: '📌',
  };

  // --- Formatte la date en français ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // URL du serveur pour les images
  const SERVER_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const status = statusConfig[issue.status] || statusConfig.open;

  return (
    <Card
      as={RouterLink}
      to={`/issues/${issue.id}`}
      bg={cardBg}
      borderRadius="xl"
      overflow="hidden"
      border="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-4px)',
        borderColor: 'blue.300',
        textDecoration: 'none',
      }}
    >
      {/* --- Section image --- */}
      <Box position="relative" h="180px" overflow="hidden">
        {issue.photoUrl ? (
          <Image
            src={`${SERVER_URL}${issue.photoUrl}`}
            alt={issue.title}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <Flex
            h="100%"
            bg="gray.100"
            align="center"
            justify="center"
            color="gray.400"
          >
            <VStack spacing={2}>
              <Text fontSize="3xl">📷</Text>
              <Text fontSize="sm">Pas d'image</Text>
            </VStack>
          </Flex>
        )}
        
        {/* Badge catégorie (superposé sur l'image) */}
        <Badge
          position="absolute"
          top={3}
          left={3}
          bg="blackAlpha.700"
          color="white"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
        >
          {categoryIcons[issue.category]} {categoryLabels[issue.category] || issue.category}
        </Badge>
      </Box>

      <CardBody p={4}>
        <VStack align="stretch" spacing={3}>
          {/* Title */}
          <Heading 
            size="sm" 
            noOfLines={2}
            color="gray.800"
          >
            {issue.title}
          </Heading>

          {/* Description */}
          <Text 
            fontSize="sm" 
            color="gray.600" 
            noOfLines={2}
          >
            {issue.description}
          </Text>

          {/* Status Badge */}
          <HStack>
            <Badge
              colorScheme={status.colorScheme}
              variant="subtle"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {status.label}
            </Badge>
          </HStack>

          {/* Meta Info */}
          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor="gray.100">
            <HStack spacing={1}>
              <Text fontSize="lg">👍</Text>
              <Text fontSize="sm" fontWeight="600" color="blue.600">
                {issue.voteCount}
              </Text>
              <Text fontSize="xs" color="gray.500">
                votes
              </Text>
            </HStack>
            
            <HStack spacing={1} color="gray.500">
              <Icon as={TimeIcon} boxSize={3} />
              <Text fontSize="xs">
                {formatDate(issue.createdAt)}
              </Text>
            </HStack>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default IssueCard;
