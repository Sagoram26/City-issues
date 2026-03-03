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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    latitude: null,
    longitude: null,
    address: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const categoryOptions = [
    { value: 'road', label: '🛣️ Voirie', description: 'Nids de poule, trottoirs...' },
    { value: 'lighting', label: '💡 Éclairage', description: 'Lampadaires défaillants...' },
    { value: 'waste', label: '🗑️ Déchets', description: 'Dépôts sauvages, poubelles...' },
    { value: 'greenery', label: '🌳 Espaces verts', description: 'Parcs, arbres, jardins...' },
    { value: 'safety', label: '⚠️ Sécurité', description: 'Dangers, signalisation...' },
    { value: 'noise', label: '🔊 Bruit', description: 'Nuisances sonores...' },
    { value: 'other', label: '📌 Autre', description: 'Autre problème...' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximum: 5MB');
        return;
      }
      
      setPhoto(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        photo: photo
      };
      
      const newIssue = await issueService.createIssue(issueData);
      navigate(`/issues/${newIssue.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Heading size="lg" color="gray.800" mb={2}>
              Signaler un problème
            </Heading>
            <Text color="gray.600" maxW="600px" mx="auto">
              Aidez à améliorer votre quartier en signalant les problèmes que vous observez. 
              Votre signalement sera visible par la communauté et les autorités.
            </Text>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Map Section */}
            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardHeader pb={2}>
                <Heading size="md">📍 Localisation</Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
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
            <Card bg={cardBg} shadow="sm" borderRadius="xl" border="1px" borderColor={borderColor}>
              <CardHeader pb={2}>
                <Heading size="md">📝 Détails du signalement</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontWeight="500">Titre</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ex: Nid de poule dangereux"
                        size="lg"
                        borderRadius="lg"
                        isDisabled={loading}
                        maxLength={200}
                      />
                      <FormHelperText>Décrivez le problème en quelques mots</FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500">Catégorie</FormLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                        isDisabled={loading}
                      >
                        {categoryOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="500">Description</FormLabel>
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
                      />
                      <FormHelperText>Minimum 10 caractères</FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="500">Adresse (optionnel)</FormLabel>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ex: 12 rue de la Paix"
                        size="lg"
                        borderRadius="lg"
                        isDisabled={loading}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="500">Photo (optionnel)</FormLabel>
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handlePhotoChange}
                        isDisabled={loading}
                        p={1}
                        borderRadius="lg"
                      />
                      <FormHelperText>JPEG, PNG, GIF ou WebP - Max 5MB</FormHelperText>
                      
                      {photoPreview && (
                        <Box mt={3} borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
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
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      borderRadius="xl"
                      isLoading={loading}
                      loadingText="Envoi en cours..."
                      isDisabled={!formData.latitude}
                      mt={2}
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
