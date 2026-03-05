// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: components/Navbar.js
// Barre de navigation principale. Affiche le logo, les liens de
// navigation (différents selon le rôle), et le menu utilisateur.
// Responsive avec un drawer pour mobile.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

// --- Composant de lien de navigation (desktop) ---
// Affiche un style différent si le lien est actif
const NavItem = ({ to, children, end = false }) => {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          size="sm"
          fontWeight={isActive ? '600' : '500'}
          color={isActive ? '#00B8F5' : 'whiteAlpha.800'}
          bg={isActive ? 'rgba(90, 110, 255, 0.2)' : 'transparent'}
          _hover={{ bg: 'rgba(90, 110, 255, 0.3)', color: 'white' }}
          borderRadius="lg"
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
};

// --- Composant principal Navbar ---
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Pour le drawer mobile

  // Déconnexion et redirection vers l'accueil
  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  // --- Composant de lien de navigation (mobile) ---
  const MobileNavItem = ({ to, children, onClick }) => (
    <NavLink to={to} onClick={onClick}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          w="full"
          justifyContent="flex-start"
          fontWeight={isActive ? '600' : '500'}
          color={isActive ? '#00B8F5' : 'whiteAlpha.800'}
          bg={isActive ? 'rgba(90, 110, 255, 0.2)' : 'transparent'}
          _hover={{ bg: 'rgba(90, 110, 255, 0.3)', color: 'white' }}
        >
          {children}
        </Button>
      )}
    </NavLink>
  );

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="linear-gradient(135deg, #0F1419 0%, #1a1f2e 100%)"
      borderBottom="1px"
      borderColor="rgba(90, 110, 255, 0.3)"
      shadow="lg"
      backdropFilter="blur(10px)"
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        h="16"
        align="center"
        justify="space-between"
      >
        {/* --- Logo --- */}
        <RouterLink to="/">
          <HStack spacing={2} cursor="pointer">
            <Text fontSize="2xl">🏙️</Text>
            <Text
              fontWeight="bold"
              fontSize="lg"
              bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
              bgClip="text"
              display={{ base: 'none', sm: 'block' }}
            >
              CityTracker
            </Text>
          </HStack>
        </RouterLink>

        {/* --- Navigation desktop (cachée sur mobile) --- */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          <NavItem to="/" end>Carte</NavItem>
          {isAuthenticated && (
            <>
              <NavItem to="/report">Signaler</NavItem>
              <NavItem to="/dashboard">Mes signalements</NavItem>
            </>
          )}
          {isAdmin && (
            <NavItem to="/admin">
              <HStack spacing={1}>
                <Text>Admin</Text>
                <Badge colorScheme="purple" fontSize="xs">Pro</Badge>
              </HStack>
            </NavItem>
          )}
        </HStack>

        {/* --- Menu utilisateur desktop --- */}
        <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rounded="full"
                cursor="pointer"
                minW={0}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={user?.username}
                    bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                    color="white"
                  />
                  <Text fontWeight="500" color="white">
                    {user?.username}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList 
                shadow="2xl" 
                borderRadius="xl" 
                py={1}
                border="1px"
                borderColor="rgba(90, 110, 255, 0.5)"
                backdropFilter="blur(10px)"
                sx={{
                  backgroundColor: '#0F1419 !important',
                  '& [role="menuitem"]': {
                    backgroundColor: 'transparent !important',
                    color: '#E0E7FF !important',
                  },
                  '& [role="menuitem"]:hover': {
                    backgroundColor: 'rgba(90, 110, 255, 0.3) !important',
                    color: '#00B8F5 !important',
                  },
                }}
              >
                <MenuItem
                  as={RouterLink}
                  to="/profile"
                  fontWeight="500"
                  fontSize="sm"
                >
                  Mon profil
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/dashboard"
                  fontWeight="500"
                  fontSize="sm"
                >
                  Mes signalements
                </MenuItem>
                <MenuDivider m={1} borderColor="rgba(90, 110, 255, 0.3)" />
                <MenuItem
                  onClick={handleLogout}
                  fontWeight="500"
                  fontSize="sm"
                  sx={{
                    color: '#FF8888 !important',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 107, 107, 0.2) !important',
                      color: '#FFB0B0 !important',
                    },
                  }}
                >
                  Déconnexion
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={2}>
              <Button
                as={RouterLink}
                to="/login"
                bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
                color="white"
                size="sm"
                fontWeight="600"
                borderRadius="lg"
                _hover={{
                  bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)",
                  boxShadow: "0 4px 16px rgba(90, 110, 255, 0.3)"
                }}
              >
                Connexion
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                bgGradient="linear-gradient(135deg, #00B8F5 0%, #00D4FF 100%)"
                color="white"
                size="sm"
                fontWeight="600"
                borderRadius="lg"
                _hover={{
                  bgGradient: "linear-gradient(135deg, #25C4FF 0%, #5A6EFF 100%)",
                  boxShadow: "0 4px 16px rgba(0, 184, 245, 0.3)"
                }}
              >
                S'inscrire
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="ghost"
          aria-label="Menu"
          icon={<HamburgerIcon />}
          color="white"
          _hover={{ bg: 'rgba(90, 110, 255, 0.3)' }}
        />

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="linear-gradient(180deg, #0F1419 0%, #1a1f2e 100%)">
            <DrawerCloseButton color="white" />
            <DrawerHeader borderBottomWidth="1px" borderColor="rgba(90, 110, 255, 0.3)">
              <HStack spacing={2}>
                <Text fontSize="xl">🏙️</Text>
                <Text 
                  fontWeight="bold"
                  bgGradient="linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)"
                  bgClip="text"
                >
                  CityTracker
                </Text>
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={2} align="stretch" pt={4}>
                <MobileNavItem to="/" onClick={onClose}>Carte</MobileNavItem>
                
                {isAuthenticated ? (
                  <>
                    <MobileNavItem to="/report" onClick={onClose}>Signaler un problème</MobileNavItem>
                    <MobileNavItem to="/dashboard" onClick={onClose}>Mes signalements</MobileNavItem>
                    <MobileNavItem to="/profile" onClick={onClose}>Mon profil</MobileNavItem>
                    {isAdmin && (
                      <MobileNavItem to="/admin" onClick={onClose}>
                        Administration
                      </MobileNavItem>
                    )}
                    <Box pt={4} borderTopWidth="1px" borderColor="rgba(90, 110, 255, 0.3)">
                      <Button
                        w="full"
                        variant="outline"
                        colorScheme="red"
                        onClick={handleLogout}
                      >
                        Déconnexion
                      </Button>
                    </Box>
                  </>
                ) : (
                  <VStack spacing={2} pt={4}>
                    <Button
                      as={RouterLink}
                      to="/login"
                      w="full"
                      bgGradient="linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)"
                      color="white"
                      _hover={{
                        bgGradient: "linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)"
                      }}
                      onClick={onClose}
                    >
                      Connexion
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/register"
                      w="full"
                      bgGradient="linear-gradient(135deg, #00B8F5 0%, #00D4FF 100%)"
                      color="white"
                      _hover={{
                        bgGradient: "linear-gradient(135deg, #25C4FF 0%, #5A6EFF 100%)"
                      }}
                      onClick={onClose}
                    >
                      S'inscrire
                    </Button>
                  </VStack>
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
};

export default Navbar;
