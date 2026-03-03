/**
 * Script pour créer un compte administrateur
 * 
 * Usage: node scripts/create-admin.js <email> <password> <username>
 * Exemple: node scripts/create-admin.js admin@ville.fr admin123 AdminVille
 */

require('dotenv').config();
const { User, sequelize } = require('../models');

const createAdmin = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('\n📋 Usage: node scripts/create-admin.js <email> <password> <username>\n');
    console.log('Exemple: node scripts/create-admin.js admin@ville.fr admin123 AdminVille\n');
    process.exit(1);
  }

  const [email, password, username] = args;

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.\n');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`⚠️  L'utilisateur ${email} existe déjà et est déjà admin.`);
      } else {
        // Promouvoir en admin
        await existingUser.update({ role: 'admin' });
        console.log(`✅ L'utilisateur ${email} a été promu administrateur !`);
      }
    } else {
      // Créer un nouvel admin
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
