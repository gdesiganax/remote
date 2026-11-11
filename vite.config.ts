import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * The CV download link is only rendered when a real PDF is present in /public.
 * Drop your CV at public/resume/Afeez-Lukmon-Bamidele-CV.pdf and rebuild.
 */
const RESUME_PATH = '/resume/Afeez-Lukmon-Bamidele-CV.pdf'
const resumeExists = existsSync(
  fileURLToPath(new URL(`./public${RESUME_PATH}`, import.meta.url)),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In development, forward the contact API to the Node server (npm run dev:api)
  server: {
    proxy: { '/api': 'http://localhost:8787' },
  },
  define: {
    __RESUME_URL__: JSON.stringify(resumeExists ? RESUME_PATH : ''),
  },
})
