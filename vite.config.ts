import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        strictPort: true,
        host: '0.0.0.0',
        proxy: {
          '/api/mercadopago': {
            target: 'https://api.mercadopago.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/mercadopago/, ''),
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                proxyReq.setHeader('Authorization', 'Bearer TEST-871494466911326-081800-a42ce7ea15d8c26c062451b6b1bde2a5-2336152427');
              });
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
