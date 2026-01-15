import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Japap - The Gossip Network',
        short_name: 'Japap',
        description: 'Anonymous scoops and news from your community.',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          {
            src: '/app-icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: '/app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
