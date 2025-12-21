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
          '/.netlify/functions/mercadopago-preference': {
            target: 'https://api.mercadopago.com',
            changeOrigin: true,
            rewrite: () => '/checkout/preferences',
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq) => {
                proxyReq.setHeader('Authorization', 'Bearer APP_USR-657378231046666-041018-9fa8621e405bab4115109307123ee12c-1099187091');
              });
            }
          },
          '/.netlify/functions/mercadopago-status': {
            target: 'https://api.mercadopago.com',
            changeOrigin: true,
            rewrite: (path) => {
              const url = new URL(path, 'http://localhost');
              const id = url.searchParams.get('id');
              return `/v1/payments/search?external_reference=${id}`;
            },
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq) => {
                proxyReq.setHeader('Authorization', 'Bearer APP_USR-657378231046666-041018-9fa8621e405bab4115109307123ee12c-1099187091');
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
