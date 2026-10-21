import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start();
