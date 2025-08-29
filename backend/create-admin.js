require('dotenv').config();
const mongoose = require('mongoose');
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (e) { try { bcrypt = require('bcrypt'); } catch (e2) { bcrypt = null; } }
const crypto = require('crypto');

// Connect to MongoDB (read from env)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alo-quick-loan';
mongoose.connect(mongoUri, {
  // modern mongoose v7+ ignores these; safe to keep for compatibility
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'],
    default: 'ADMIN'
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  permissions: { type: [String], default: [] },
  lastLoginAt: Date,
  lastLoginIp: String,
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    const desiredUsername = 'vay15s';
    const desiredPassword = '0927996903';

    // Upsert admin user
    let passwordToStore = desiredPassword;
    if (bcrypt) {
      try {
        passwordToStore = await bcrypt.hash(desiredPassword, 10);
      } catch (e) {
        // fallback to sha256
        const salt = crypto.randomBytes(16).toString('hex');
        const hex = crypto.createHmac('sha256', salt).update(desiredPassword).digest('hex');
        passwordToStore = `sha256$${salt}$${hex}`;
      }
    } else {
      const salt = crypto.randomBytes(16).toString('hex');
      const hex = crypto.createHmac('sha256', salt).update(desiredPassword).digest('hex');
      passwordToStore = `sha256$${salt}$${hex}`;
    }

    const result = await Admin.findOneAndUpdate(
      { username: desiredUsername },
      {
        username: desiredUsername,
        password: passwordToStore,
        fullName: 'System Administrator',
        email: 'admin@15s.com',
        phoneNumber: '0123456789',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        permissions: ['*'],
      },
      { upsert: true, new: true }
    );

    console.log('Admin user ensured!');
    console.log('Username:', desiredUsername);
    console.log('Password:', desiredPassword, bcrypt ? '(bcrypt hashed or sha256 fallback in DB)' : '(sha256 hashed in DB)');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
