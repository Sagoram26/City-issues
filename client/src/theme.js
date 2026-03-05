// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: theme.js - THÈME MÉTALLISÉ PREMIUM
// Design modern, sharp et professionnel avec gradients sophistiqués
// ═══════════════════════════════════════════════════════════════════════════

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // --- PALETTE DE COULEURS MÉTALLISÉE ---
  colors: {
    // Palette principale : De slate foncé à argent métallique
    brand: {
      50: '#F8F9FB',      // Blanc givré
      100: '#E8ECFF',     // Bleu ultra clair
      200: '#C7D5FF',     // Bleu glacier
      300: '#9EAEFF',     // Bleu perlé
      400: '#7B8EFF',     // Bleu métallisé
      500: '#5A6EFF',     // PRIMARY : Bleu électrique
      600: '#4E5EE6',     // Bleu deep
      700: '#3E4BA2',     // Slate profond
      800: '#2A3159',     // Charbon noir bleu
      900: '#111318',     // Noir cosmique
    },
    // Palette accent : Gradients métalliques argent/or
    accent: {
      50: '#FFFBF7',      // Or très clair
      100: '#FFF3E0',     // Or doux
      200: '#FFE0B2',     // Or miel
      300: '#FFD580',     // Or métallique
      400: '#FFB84D',     // Or riche
      500: '#FF9800',     // Or primaire
      600: '#E68900',     // Or foncé
      700: '#CC7700',     // Cuivre
      800: '#993300',     // Bronze foncé
      900: '#661100',
    },
    // Gris métallisé charbon
    gray: {
      50: '#FAFBFC',      // Blanc cosmique
      100: '#EEF1F5',     // Gris ultra clair
      200: '#DCE3ED',     // Gris nacré
      300: '#C8D0E0',     // Gris chrome
      400: '#9CA8BE',     // Gris acier
      500: '#6B7793',     // Gris profond
      600: '#4F5A77',     // Gris foncé
      700: '#3A4557',     // Charbon bleu
      800: '#232D3F',     // Noir bleu
      900: '#0F1419',     // Noir cosmique
    },
    // Cyan/Turquoise électrique
    cyan: {
      50: '#E0F7FF',
      100: '#B3E5FF',
      200: '#80D9FF',
      300: '#4DD0FF',
      400: '#25C4FF',
      500: '#00B8F5',     // Cyan vif
      600: '#00A3DB',
      700: '#0088C1',
      800: '#006AA8',
    },
    // Violet électrique
    violet: {
      50: '#F3E5FF',
      100: '#E1B3FF',
      200: '#CC80FF',
      300: '#B84DFF',
      400: '#A820FF',
      500: '#9D00FF',     // Violet électrique
      600: '#8B00E6',
      700: '#7900CC',
    },
    // Succès : Vert émeraude
    success: {
      50: '#E0F5F0',
      100: '#B3E5DB',
      200: '#80D9C8',
      300: '#4DCDB5',
      400: '#26C1A2',
      500: '#00B390',     // Émeraude
      600: '#009975',
      700: '#007F5F',
      800: '#00664A',
    },
    // Warning : Ambre riche
    warning: {
      50: '#FFF8E1',
      100: '#FFF0B3',
      200: '#FFE680',
      300: '#FFDD4D',
      400: '#FFD41A',
      500: '#FFC800',     // Ambre
      600: '#E6B800',
      700: '#CCA800',
      800: '#B39800',
    },
    // Danger : Crimson métallique
    danger: {
      50: '#FFE5E5',
      100: '#FFB3B3',
      200: '#FF8080',
      300: '#FF4D4D',
      400: '#FF1A1A',
      500: '#E60000',     // Crimson
      600: '#CC0000',
      700: '#990000',
      800: '#660000',
    },
  },

  // --- POLICES ---
  fonts: {
    heading: '"Inter", "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"Inter", "Segoe UI", Helvetica, Arial, sans-serif',
    mono: '"IBM Plex Mono", monospace',
  },

  // --- TAILLES ---
  space: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
  },

  // --- STYLES GLOBAUX ---
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #0F1419 0%, #1a1f2e 50%, #111318 100%)',
        color: 'gray.50',
        fontWeight: '500',
      },
      html: {
        scrollBehavior: 'smooth',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'gray.900',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'linear-gradient(180deg, #5A6EFF 0%, #00B8F5 100%)',
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: 'linear-gradient(180deg, #7B8EFF 0%, #25C4FF 100%)',
      },
    },
  },

  // --- COMPOSANTS PERSONNALISÉS ---
  components: {
    Button: {
      baseStyle: {
        fontWeight: '700',
        borderRadius: 'lg',
        fontSize: 'sm',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        _focus: {
          boxShadow: '0 0 0 3px rgba(90, 110, 255, 0.4)',
        },
      },
      variants: {
        solid: {
          bg: 'linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(90, 110, 255, 0.3)',
          _hover: {
            bg: 'linear-gradient(135deg, #7B8EFF 0%, #5A6EFF 100%)',
            boxShadow: '0 12px 40px rgba(90, 110, 255, 0.5)',
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'translateY(0px)',
            boxShadow: '0 4px 20px rgba(90, 110, 255, 0.4)',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: '#5A6EFF',
          color: '#5A6EFF',
          bg: 'transparent',
          _hover: {
            bg: 'rgba(90, 110, 255, 0.1)',
            borderColor: '#7B8EFF',
          },
        },
        ghost: {
          color: 'gray.100',
          _hover: {
            bg: 'rgba(90, 110, 255, 0.15)',
          },
        },
        gradient: {
          bg: 'linear-gradient(135deg, #5A6EFF 0%, #00B8F5 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0, 184, 245, 0.3)',
          _hover: {
            boxShadow: '0 12px 48px rgba(0, 184, 245, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },

    Input: {
      variants: {
        outline: {
          field: {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'lg',
            border: '1.5px solid',
            borderColor: 'rgba(90, 110, 255, 0.2)',
            color: 'gray.50',
            _focus: {
              bg: 'rgba(255, 255, 255, 0.08)',
              borderColor: '#5A6EFF',
              boxShadow: '0 0 0 3px rgba(90, 110, 255, 0.2)',
            },
            _placeholder: {
              color: 'gray.500',
            },
          },
        },
      },
    },

    Textarea: {
      variants: {
        outline: {
          bg: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'lg',
          border: '1.5px solid',
          borderColor: 'rgba(90, 110, 255, 0.2)',
          color: 'gray.50',
          _focus: {
            bg: 'rgba(255, 255, 255, 0.08)',
            borderColor: '#5A6EFF',
            boxShadow: '0 0 0 3px rgba(90, 110, 255, 0.2)',
          },
        },
      },
    },

    Select: {
      variants: {
        outline: {
          field: {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'lg',
            border: '1.5px solid',
            borderColor: 'rgba(90, 110, 255, 0.2)',
            color: 'gray.50',
            _focus: {
              borderColor: '#5A6EFF',
              boxShadow: '0 0 0 3px rgba(90, 110, 255, 0.2)',
            },
          },
        },
      },
    },

    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          bg: 'linear-gradient(135deg, rgba(42, 49, 89, 0.7) 0%, rgba(35, 45, 63, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(90, 110, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          _hover: {
            borderColor: 'rgba(90, 110, 255, 0.4)',
            boxShadow: '0 12px 48px rgba(90, 110, 255, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
        fontWeight: '700',
        fontSize: 'xs',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 4px 12px rgba(90, 110, 255, 0.2)',
      },
      variants: {
        solid: {
          bg: 'linear-gradient(135deg, #5A6EFF 0%, #4E5EE6 100%)',
          color: 'white',
        },
        subtle: {
          bg: 'rgba(90, 110, 255, 0.15)',
          color: '#7B8EFF',
        },
      },
    },

    Heading: {
      baseStyle: {
        fontWeight: '800',
        letterSpacing: '-0.5px',
      },
    },

    Text: {
      baseStyle: {
        color: 'gray.100',
      },
    },

    Alert: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          border: '1px solid',
          bg: 'rgba(42, 49, 89, 0.5)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

export default theme;
