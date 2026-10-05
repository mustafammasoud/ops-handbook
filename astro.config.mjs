// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// Ops Handbook is a fully static site so it can be deployed to Cloudflare Pages
// (and any other static host) without an adapter.
export default defineConfig({
  site: 'https://ops-handbook-dvp.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      // Dual themes so the same markup works in light and dark mode.
      // Code blocks are always dark terminal/editor surfaces (the warm
      // paper UI paints their background via --c-code-bg in global.css),
      // so light mode reads the dark gruvbox palette too — earth-tone
      // colors that match the warm paper / dark coffee UI.
      themes: {
        light: 'gruvbox-dark-medium',
        dark: 'gruvbox-dark-medium',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
