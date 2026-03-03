/**
 * Script pour peupler la base de données avec des données de test
 * 
 * Usage: node scripts/seed-data.js
 */

require('dotenv').config();
const { User, Issue, sequelize } = require('../models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.\n');

    // Créer des utilisateurs de test
    console.log('📝 Création des utilisateurs...\n');

    const admin = await User.findOrCreate({
      where: { email: 'admin@ville.fr' },
      defaults: {
        email: 'admin@ville.fr',
        password: 'admin123',
        username: 'AdminVille',
        role: 'admin'
      }
    });
    console.log(`   Admin: admin@ville.fr / admin123 ${admin[1] ? '(créé)' : '(existe déjà)'}`);

    const citizen1 = await User.findOrCreate({
      where: { email: 'citoyen1@test.fr' },
      defaults: {
        email: 'citoyen1@test.fr',
        password: 'test123',
        username: 'JeanDupont',
        role: 'citizen'
      }
    });
    console.log(`   Citoyen 1: citoyen1@test.fr / test123 ${citizen1[1] ? '(créé)' : '(existe déjà)'}`);

    const citizen2 = await User.findOrCreate({
      where: { email: 'citoyen2@test.fr' },
      defaults: {
        email: 'citoyen2@test.fr',
        password: 'test123',
        username: 'MarieDurand',
        role: 'citizen'
      }
    });
    console.log(`   Citoyen 2: citoyen2@test.fr / test123 ${citizen2[1] ? '(créé)' : '(existe déjà)'}`);

    // Créer des signalements de test
    console.log('\n📝 Création des signalements de test...\n');

    const issuesData = [
      {
        title: 'Nid de poule dangereux rue Victor Hugo',
        description: 'Un nid de poule très profond s\'est formé au niveau du numéro 45. Plusieurs vélos ont déjà été endommagés et c\'est dangereux pour les voitures.',
        latitude: 48.8566,
        longitude: 2.3522,
        address: '45 Rue Victor Hugo',
        category: 'road',
        status: 'open',
        userId: citizen1[0].id
      },
      {
        title: 'Lampadaire en panne depuis 2 semaines',
        description: 'Le lampadaire devant l\'école maternelle ne fonctionne plus depuis deux semaines. C\'est très dangereux le soir pour les parents et enfants.',
        latitude: 48.8576,
        longitude: 2.3510,
        address: 'Place de l\'École',
        category: 'lighting',
        status: 'in_progress',
        userId: citizen1[0].id
      },
      {
        title: 'Dépôt sauvage de déchets',
        description: 'Un dépôt sauvage de déchets ménagers et encombrants s\'est formé au coin de la rue. Ça commence à sentir très mauvais.',
        latitude: 48.8590,
        longitude: 2.3545,
        address: 'Coin rue de la Liberté / rue des Fleurs',
        category: 'waste',
        status: 'open',
        userId: citizen2[0].id
      },
      {
        title: 'Arbre dangereux menaçant de tomber',
        description: 'Un grand arbre dans le parc municipal penche dangereusement après la tempête de la semaine dernière. Des branches tombent régulièrement.',
        latitude: 48.8600,
        longitude: 2.3490,
        address: 'Parc Municipal',
        category: 'greenery',
        status: 'open',
        userId: citizen2[0].id,
        voteCount: 5
      },
      {
        title: 'Passage piéton effacé',
        description: 'Les bandes blanches du passage piéton sont complètement effacées. Les conducteurs ne s\'arrêtent plus.',
        latitude: 48.8550,
        longitude: 2.3560,
        address: 'Carrefour Principal',
        category: 'safety',
        status: 'resolved',
        userId: citizen1[0].id
      }
    ];

    for (const issueData of issuesData) {
      const [issue, created] = await Issue.findOrCreate({
        where: { title: issueData.title },
        defaults: issueData
      });
      console.log(`   ${created ? '✅' : '⏭️'} ${issue.title.substring(0, 40)}...`);
    }

    console.log('\n✅ Base de données peuplée avec succès !\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 COMPTES DE TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('🔴 ADMIN:     admin@ville.fr      / admin123');
    console.log('🟢 Citoyen 1: citoyen1@test.fr    / test123');
    console.log('🟢 Citoyen 2: citoyen2@test.fr    / test123');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await sequelize.close();
    process.exit(1);
  }
};

seedData();
