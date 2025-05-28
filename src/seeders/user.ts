// seeders/seed-users.ts
import mongoose from 'mongoose';
import User from '../models/userModel';
import CONFIG from '../config/vars';

async function seed() {
  await mongoose.connect(CONFIG.ATLAS_URI || '');
  await User.create([
    { name: 'Admin', role: 'admin' },
    { name: 'John Doe', role: 'user' },
  ]);
  console.log('✅ Seeded users!');
  await mongoose.disconnect();
}

seed().catch(console.error);
