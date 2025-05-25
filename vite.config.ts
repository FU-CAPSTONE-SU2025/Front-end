import { defineConfig } from 'vite'
import { githubPagesSpa } from "@sctg/vite-plugin-github-pages-spa";
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      githubPagesSpa({
      // Options are optional. This is the added part
      verbose: true, // Set to false to disable console logs
    }),
  ],
  base: '/Front-end/',
  //this too is the added part
  
})
