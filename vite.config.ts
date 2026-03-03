import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Connect, Plugin } from 'vite';
import {defineConfig, loadEnv} from 'vite';

/** Vite plugin that registers /api/submit directly in the dev server middleware,
 *  avoiding the need for a separate Express process on port 3001. */
function apiPlugin(sheetWebhookUrl: string): Plugin {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/submit', (async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ status: 'error', message: 'Method not allowed' }));
          return;
        }

        if (!sheetWebhookUrl) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'error', message: 'VITE_SHEET_WEBHOOK_URL is not set.' }));
          return;
        }

        try {
          // Read request body
          const chunks: Buffer[] = [];
          for await (const chunk of req as AsyncIterable<Buffer>) {
            chunks.push(chunk);
          }
          const body = Buffer.concat(chunks).toString();

          const response = await fetch(sheetWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            redirect: 'follow',
          });

          const text = await response.text();
          console.log('[v0] Apps Script response:', text);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'success', response: text }));
        } catch (err) {
          console.error('[v0] Failed to forward to Apps Script:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'error', message: String(err) }));
        }
      }) as Connect.NextHandleFunction);
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), apiPlugin(env.VITE_SHEET_WEBHOOK_URL || '')],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
