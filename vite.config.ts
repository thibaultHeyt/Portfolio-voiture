import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Miniflare (le runtime lancé par le plugin Cloudflare) refuse de démarrer sous
// Bun sur Windows : le serveur de dev tombait avant d'afficher la page. Le
// worker ne sert que /api/*, donc en dev on monte le même fichier Hono dans le
// serveur Vite, et le build garde le plugin pour produire le Worker déployé.
// Le projet n'embarque pas @types/node : on décrit juste ce que le middleware
// utilise de la requête et de la réponse Node.
type DevRequest = AsyncIterable<string> & { url?: string; method?: string; headers: Record<string, string> }
type DevResponse = { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }

function devWorker(): Plugin {
  return {
    name: 'dev-worker',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (rawReq, rawRes, next) => {
        const req = rawReq as unknown as DevRequest
        const res = rawRes as unknown as DevResponse
        if (!req.url?.startsWith('/api/')) return next()

        let body = ''
        for await (const chunk of req) body += chunk

        const { default: app } = await server.ssrLoadModule('/src/worker/index.ts')
        const request = new Request(new URL(req.url, 'http://localhost'), {
          method: req.method,
          headers: new Headers(req.headers),
          body: body || undefined,
        })
        const response = await app.fetch(request, {
          ASSETS: { fetch: () => new Response(null, { status: 404 }) },
        })

        res.statusCode = response.status
        response.headers.forEach((value: string, key: string) => res.setHeader(key, value))
        res.end(await response.text())
      })
    },
  }
}

// VITE_BASE permet de builder pour un sous-dossier (GitHub Pages sert
// `/<dépôt>/`) ; sans lui, le site est servi à la racine du domaine.
const base = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.VITE_BASE || '/'

export default defineConfig(({ command }) => ({
  base,
  plugins: [react(), tailwindcss(), command === 'build' ? cloudflare() : devWorker()],
  server: { port: 5173, strictPort: false, host: '127.0.0.1' },
}))
