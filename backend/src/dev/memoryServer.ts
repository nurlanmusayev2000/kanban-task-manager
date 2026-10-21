/**
 * Development entry point that needs no MongoDB install: starts an in-memory
 * MongoDB, seeds the demo user and board, then starts the API.
 * Data is lost when the process stops or restarts.
 */
import 'dotenv/config';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function main() {
  const mongod = await MongoMemoryServer.create();

  // Set before the app's modules load, because config/env.ts reads these on import.
  process.env.MONGODB_URI = mongod.getUri('kanban');
  process.env.JWT_SECRET ??= 'dev-memory-secret-do-not-use-in-production';

  const { connectDB } = await import('../config/database.js');
  const { seedDemoData } = await import('../seed/demoData.js');
  const { env } = await import('../config/env.js');
  const { app } = await import('../app.js');

  await connectDB();
  await seedDemoData();

  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} with an in-memory MongoDB`);
  });

  const shutdown = async () => {
    server.close();
    const mongoose = await import('mongoose');
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Failed to start the in-memory dev server:', error);
  process.exit(1);
});
