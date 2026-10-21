import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { seedDemoData } from '../seed/demoData';

async function main() {
  await connectDB();
  await seedDemoData();
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Seeding failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
