import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Tailwind v3 is wired up via postcss.config.js + tailwind.config.js instead
// of the v4 @tailwindcss/vite plugin, so no Tailwind plugin is needed here.
export default defineConfig({
  plugins: [react()],
})
