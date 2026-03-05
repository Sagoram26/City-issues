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
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';

const IssueCard = ({ issue, isNew, onNewSeen }) => {
  // Marquer comme vu si c'est nouveau
  React.useEffect(() => {
    if (isNew && onNewSeen) {
      const timer = setTimeout(() => {
        onNewSeen();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew, onNewSeen]);
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

  const status = statusConfig[issue.status] || statusConfig.open;

  return (
    <Card
      as={RouterLink}
      to={`/issues/${issue.id}`}
      bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      overflow="hidden"
      border="1px"
      borderColor={isNew ? "rgba(16, 185, 129, 0.5)" : "rgba(90, 110, 255, 0.2)"}
      boxShadow={isNew ? "0 10px 40px rgba(16, 185, 129, 0.3)" : "lg"}
      transition="all 0.3s"
      position="relative"
      className={isNew ? 'new-issue-card' : ''}
      _hover={{
        boxShadow: '0 15px 50px rgba(90, 110, 255, 0.4)',
        transform: 'translateY(-4px)',
        borderColor: 'rgba(90, 110, 255, 0.5)',
        textDecoration: 'none',
      }}
    >
      {isNew && (
        <Badge
          position="absolute"
          top="-8px"
          right="12px"
          bg="#10B981"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={2}
          py={1}
          borderRadius="full"
          zIndex={10}
          textTransform="uppercase"
          className="badge-new"
          boxShadow="0 4px 12px rgba(16, 185, 129, 0.4)"
        >
          ✨ Nouveau
        </Badge>
      )}
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
            bg="linear-gradient(135deg, rgba(42, 49, 89, 0.8) 0%, rgba(35, 45, 63, 0.8) 100%)"
            align="center"
            justify="center"
            color="whiteAlpha.500"
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
          bg="rgba(0, 0, 0, 0.8)"
          backdropFilter="blur(6px)"
          color="white"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
          border="1px"
          borderColor="rgba(90, 110, 255, 0.5)"
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
            bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
            bgClip="text"
          >
            {issue.title}
          </Heading>

          {/* Description */}
          <Text 
            fontSize="sm" 
            color="whiteAlpha.700" 
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
          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor="rgba(90, 110, 255, 0.2)">
            <HStack spacing={1}>
              <Text fontSize="lg">👍</Text>
              <Text 
                fontSize="sm" 
                fontWeight="600" 
                bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                bgClip="text"
              >
                {issue.voteCount}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.600">
                votes
              </Text>
            </HStack>
            
            <HStack spacing={1} color="whiteAlpha.600">
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
