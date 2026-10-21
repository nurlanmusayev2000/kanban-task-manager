import { setupServer } from 'msw/node';

export const API_URL = 'http://localhost:5001/api';

/** MSW server shared by all tests; each test adds the handlers it needs with server.use(). */
export const server = setupServer();
