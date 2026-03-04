// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: scripts/create-admin.js
// Script CLI pour créer un compte administrateur.
// Si l'utilisateur existe déjà, il est promu admin.
// 
// Usage: node scripts/create-admin.js <email> <password> <username>
// Exemple: node scripts/create-admin.js admin@ville.fr admin123 AdminVille
// ═══════════════════════════════════════════════════════════════════════════

require('dotenv').config();
const { User, sequelize } = require('../models');

const createAdmin = async () => {
  // Récupère les arguments de la ligne de commande
  const args = process.argv.slice(2);
  
  // Vérifie que tous les arguments sont fournis
  if (args.length < 3) {
    console.log('\n📋 Usage: node scripts/create-admin.js <email> <password> <username>\n');
    console.log('Exemple: node scripts/create-admin.js admin@ville.fr admin123 AdminVille\n');
    process.exit(1);
  }

  const [email, password, username] = args;

  try {
    // Teste la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.\n');

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`⚠️  L'utilisateur ${email} existe déjà et est déjà admin.`);
      } else {
        // Promouvoir l'utilisateur existant en admin
        await existingUser.update({ role: 'admin' });
        console.log(`✅ L'utilisateur ${email} a été promu administrateur !`);
      }
    } else {
      // Créer un nouvel utilisateur admin (le hook hashera le mot de passe)
      const admin = await User.create({
        email: email.toLowerCase(),
        password,
        username,
        role: 'admin'
      });
      
      console.log('✅ Compte administrateur créé avec succès !\n');
      console.log('📧 Email:', admin.email);
      console.log('👤 Username:', admin.username);
      console.log('🔑 Role:', admin.role);
    }

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('   Le nom d\'utilisateur ou l\'email existe déjà.');
    }
    
    await sequelize.close();
    process.exit(1);
  }
};

createAdmin();
