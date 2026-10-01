import process from 'node:process';
import { createServer } from 'vite';

const port = Number(process.env.PORT) || 5173;
const server = await createServer({
  server: {
    host: '0.0.0.0',
    port,
    strictPort: true
  }
});

await server.listen();
server.printUrls();