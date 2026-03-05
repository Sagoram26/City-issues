// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: pages/ReportIssuePage.js
// Page de création d'un nouveau signalement. Formulaire complet:
// - Titre, description, catégorie
// - Sélection de localisation sur la carte (IssueMap)
// - Upload de photo (validation type/taille, preview)
// - Soumission via issueService.createIssue() avec FormData
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Button,
  Alert,
  AlertIcon,
  Image,
  SimpleGrid,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import IssueMap from '../components/IssueMap';
import issueService from '../services/issueService';

const ReportIssuePage = () => {
  // --- States du formulaire ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    latitude: null,      // Sélectionné sur la carte
    longitude: null,
    address: ''          // Optionnel
  });
  const [photo, setPhoto] = useState(null);         // Fichier à uploader
  const [photoPreview, setPhotoPreview] = useState(null); // Preview base64
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Options de catégorie avec icônes
  const categoryOptions = [
    { value: 'road', label: '🛣️ Voirie', description: 'Nids de poule, trottoirs...' },
    { value: 'lighting', label: '💡 Éclairage', description: 'Lampadaires défaillants...' },
    { value: 'waste', label: '🗑️ Déchets', description: 'Dépôts sauvages, poubelles...' },
    { value: 'greenery', label: '🌳 Espaces verts', description: 'Parcs, arbres, jardins...' },
    { value: 'safety', label: '⚠️ Sécurité', description: 'Dangers, signalisation...' },
    { value: 'noise', label: '🔊 Bruit', description: 'Nuisances sonores...' },
    { value: 'other', label: '📌 Autre', description: 'Autre problème...' },
  ];

  // Met à jour les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // --- Gestion de l'upload de photo ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifie le type MIME (images uniquement)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
        return;
      }
      
      // Vérifie la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximum: 5MB');
        return;
      }
      
      setPhoto(file);
      setError('');
      
      // Génère un preview base64 pour l'affichage
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback quand l'utilisateur clique sur la carte
  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  // --- Soumission du formulaire ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.title || formData.title.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères');
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Prépare les données (y compris la photo)
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        photo: photo  // Le service convertira en FormData
      };
      
      const newIssue = await issueService.createIssue(issueData);
      navigate(`/issues/${newIssue.id}`); // Redirige vers le détail
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="calc(100vh - 64px)" bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)" py={8}>
      <Container maxW="1200px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Heading 
              size="lg" 
              bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
              bgClip="text"
              mb={2}
            >
              Signaler un problème
            </Heading>
            <Text color="whiteAlpha.700" maxW="600px" mx="auto">
              Aidez à améliorer votre quartier en signalant les problèmes que vous observez. 
              Votre signalement sera visible par la communauté et les autorités.
            </Text>
          </Box>

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

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Map Section */}
            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardHeader pb={2}>
                <Heading size="md" color="white">📍 Localisation</Heading>
                <Text fontSize="sm" color="whiteAlpha.600" mt={1}>
                  Cliquez sur la carte pour indiquer l'emplacement du problème
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <Box borderRadius="lg" overflow="hidden" mb={4}>
                  <IssueMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={formData.latitude && formData.longitude ? {
                      latitude: formData.latitude,
                      longitude: formData.longitude
                    } : null}
                    height="350px"
                    zoom={13}
                  />
                </Box>
                
                {formData.latitude && formData.longitude ? (
                  <Alert status="success" borderRadius="lg" variant="subtle">
                    <Icon as={CheckCircleIcon} color="green.500" mr={2} />
                    <Text fontSize="sm">
                      Emplacement sélectionné: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </Text>
                  </Alert>
                ) : (
                  <Alert status="info" borderRadius="lg" variant="subtle">
                    <AlertIcon />
                    <Text fontSize="sm">👆 Cliquez sur la carte pour sélectionner un emplacement</Text>
                  </Alert>
                )}
              </CardBody>
            </Card>

            {/* Form Section */}
            <Card 
              bg="linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)"
              backdropFilter="blur(10px)"
              shadow="lg" 
              borderRadius="xl" 
              border="1px" 
              borderColor="rgba(90, 110, 255, 0.2)"
            >
              <CardHeader pb={2}>
                <Heading size="md" color="white">📝 Détails du signalement</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontWeight="500" color="white">Titre</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ex: Nid de poule dangereux"
                        size="lg"
                        borderRadius="lg"
                        isDisabled={loading}
                        maxLength={200}
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                        _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 3px rgba(90, 110, 255, 0.3)" }}
                        _placeholder={{ color: 'whiteAlpha.500' }}
                      />
                      <FormHelperText color="whiteAlpha.600">Décrivez le problème en quelques mots</FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500" color="white">Catégorie</FormLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                        isDisabled={loading}
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                        _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 3px rgba(90, 110, 255, 0.3)" }}
                        sx={{
                          '& option': {
                            bg: '#1a1f2e',
                            color: 'white',
                          }
                        }}
                      >
                        {categoryOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500" color="white">Description</FormLabel>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Décrivez le problème en détail : où exactement ? depuis quand ? quel impact ?"
                        size="lg"
                        borderRadius="lg"
                        minH="120px"
                        isDisabled={loading}
                        maxLength={5000}
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                        _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 3px rgba(90, 110, 255, 0.3)" }}
                        _placeholder={{ color: 'whiteAlpha.500' }}
                      />
                      <FormHelperText color="whiteAlpha.600">Minimum 10 caractères</FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="500" color="white">Adresse (optionnel)</FormLabel>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ex: 12 rue de la Paix"
                        size="lg"
                        borderRadius="lg"
                        isDisabled={loading}
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                        _hover={{ borderColor: "rgba(90, 110, 255, 0.8)" }}
                        _focus={{ borderColor: "#5A6EFF", boxShadow: "0 0 0 3px rgba(90, 110, 255, 0.3)" }}
                        _placeholder={{ color: 'whiteAlpha.500' }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="500" color="white">Photo (optionnel)</FormLabel>
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handlePhotoChange}
                        isDisabled={loading}
                        p={1}
                        borderRadius="lg"
                        bg="rgba(42, 49, 89, 0.9)"
                        color="white"
                        borderColor="rgba(90, 110, 255, 0.5)"
                      />
                      <FormHelperText color="whiteAlpha.600">JPEG, PNG, GIF ou WebP - Max 5MB</FormHelperText>
                      
                      {photoPreview && (
                        <Box mt={3} borderRadius="lg" overflow="hidden" border="1px" borderColor="rgba(90, 110, 255, 0.3)">
                          <Image 
                            src={photoPreview} 
                            alt="Aperçu" 
                            maxH="200px"
                            w="100%"
                            objectFit="cover"
                          />
                        </Box>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
                      color="white"
                      size="lg"
                      w="full"
                      borderRadius="xl"
                      isLoading={loading}
                      loadingText="Envoi en cours..."
                      isDisabled={!formData.latitude}
                      mt={2}
                      fontWeight="600"
                      _hover={{
                        bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)",
                        boxShadow: "0 8px 32px rgba(90, 110, 255, 0.4)"
                      }}
                    >
                      ✉️ Envoyer le signalement
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default ReportIssuePage;
