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
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const NavItem = ({ to, children, end = false }) => {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          size="sm"
          fontWeight={isActive ? '600' : '500'}
          color={isActive ? 'brand.600' : 'gray.600'}
          bg={isActive ? 'brand.50' : 'transparent'}
          _hover={{ bg: 'gray.100', color: 'gray.800' }}
          borderRadius="lg"
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const MobileNavItem = ({ to, children, onClick }) => (
    <NavLink to={to} onClick={onClick}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          w="full"
          justifyContent="flex-start"
          fontWeight={isActive ? '600' : '500'}
          color={isActive ? 'brand.600' : 'gray.700'}
          bg={isActive ? 'brand.50' : 'transparent'}
          _hover={{ bg: 'gray.100' }}
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
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        h="16"
        align="center"
        justify="space-between"
      >
        {/* Logo */}
        <RouterLink to="/">
          <HStack spacing={2} cursor="pointer">
            <Text fontSize="2xl">🏙️</Text>
            <Text
              fontWeight="bold"
              fontSize="lg"
              color="gray.800"
              display={{ base: 'none', sm: 'block' }}
            >
              CityTracker
            </Text>
          </HStack>
        </RouterLink>

        {/* Desktop Navigation */}
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

        {/* Desktop Auth */}
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
                    bg="brand.500"
                    color="white"
                  />
                  <Text fontWeight="500" color="gray.700">
                    {user?.username}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList shadow="lg" borderRadius="xl" py={2}>
                <MenuItem
                  as={RouterLink}
                  to="/profile"
                  fontWeight="500"
                  _hover={{ bg: 'gray.50' }}
                >
                  Mon profil
                </MenuItem>
                <MenuItem
                  as={RouterLink}
                  to="/dashboard"
                  fontWeight="500"
                  _hover={{ bg: 'gray.50' }}
                >
                  Mes signalements
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={handleLogout}
                  color="red.500"
                  fontWeight="500"
                  _hover={{ bg: 'red.50' }}
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
                variant="ghost"
                size="sm"
                fontWeight="500"
              >
                Connexion
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="brand"
                size="sm"
                fontWeight="600"
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
        />

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack spacing={2}>
                <Text fontSize="xl">🏙️</Text>
                <Text fontWeight="bold">CityTracker</Text>
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
                    <Box pt={4} borderTopWidth="1px">
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
                      variant="outline"
                      onClick={onClose}
                    >
                      Connexion
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/register"
                      w="full"
                      colorScheme="brand"
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
