import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { getLiveSharePointData, refreshSharePointData, getSharePointStatus } from './netlify/functions/sharepointHelper';

function netlifyFunctionsDevMiddleware(): Plugin {
  return {
    name: 'netlify-functions-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // CORS headers for dev API calls
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (url === '/.netlify/functions/sharepoint-live' || url === '/api/sharepoint/live') {
          try {
            const isForce = req.url?.includes('force=true');
            const data = await getLiveSharePointData(isForce);
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                issues: data.issues,
                summaries: data.summaries,
                lastSyncTime: data.lastSyncTime,
                lastSyncIso: data.lastSyncIso,
                totalIssues: data.totalIssues,
                status: data.status,
                targetUrl: data.targetUrl,
                dataHash: data.dataHash,
                error: data.error,
              })
            );
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e?.message }));
          }
          return;
        }

        if (url === '/.netlify/functions/sharepoint-refresh' || url === '/api/sharepoint/refresh') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              let customUrl: string | undefined;
              if (body) {
                try {
                  const parsed = JSON.parse(body);
                  if (parsed && typeof parsed.url === 'string') {
                    customUrl = parsed.url;
                  }
                } catch {
                  // Not JSON
                }
              }
              const data = await refreshSharePointData(customUrl);
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  issues: data.issues,
                  summaries: data.summaries,
                  lastSyncTime: data.lastSyncTime,
                  lastSyncIso: data.lastSyncIso,
                  totalIssues: data.totalIssues,
                  status: data.status,
                  targetUrl: data.targetUrl,
                  dataHash: data.dataHash,
                  error: data.error,
                })
              );
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: e?.message }));
            }
          });
          return;
        }

        if (url === '/.netlify/functions/sharepoint-status' || url === '/api/sharepoint/status') {
          try {
            const status = getSharePointStatus();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ connected: false, error: e?.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), netlifyFunctionsDevMiddleware()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
