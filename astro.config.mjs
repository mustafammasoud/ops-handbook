// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';

// Arabic-script ranges (Arabic, Arabic Supplement/Extended-A, Thaana, and
// Arabic presentation forms) used to classify rendered content blocks.
const ARABIC_SCRIPT = /[\u0600-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Deterministic base direction for content blocks inside mixed-direction
// articles. Arabic articles render with dir="rtl" on the <article>; purely
// English blocks inside them (headings like "Overview", English table
// headers, short English paragraphs) get an explicit dir="ltr" so they keep
// an LTR base and align to the left, exactly as they did before. Any block
// that contains Arabic script is left alone and inherits the article's RTL
// base, so mixed lines like `**Taint:** بتحط شرط…` never mis-resolve —
// unlike the old `unicode-bidi: plaintext` heuristic, which guessed the
// direction from the first strong character and flipped Arabic blocks that
// merely began with a Latin technical term. Runs at build time (Sätteri
// hast plugin), so the shipped HTML is correct without client-side JS.
const contentBlockDirection = {
  name: 'content-block-direction',
  element: {
    // Direction is set per LIST (ul/ol/dl), never per list item: a
    // dir="ltr" on individual <li>/<dt>/<dd> inside an RTL <ul> resolves
    // the surrounding gap/bullet differently in Chromium vs Firefox
    // (Chromium collapses the gap at the item start, Firefox at the end).
    // Purely-English lists get dir="ltr" here; mixed lists inherit the
    // article's RTL and each item's text reorders via the Unicode bidi
    // algorithm. A defensive CSS rule (.prose list items) in global.css
    // covers hand-authored dir-less items in LTR pages.
    filter: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'figcaption', 'caption', 'summary', 'th', 'td',
      'ul', 'ol', 'dl',
    ],
    /**
     * @param {import('hast').Element} node
     * @param {import('satteri').HastVisitorContext} ctx
     */
    visit(node, ctx) {
      if (node.properties?.dir != null) return;
      const text = ctx.textContent(node);
      if (text.trim() && !ARABIC_SCRIPT.test(text)) {
        ctx.setProperty(node, 'dir', 'ltr');
      }
    },
  },
};

// Ops Handbook is a fully static site so it can be deployed to Cloudflare Pages
// without an adapter.
export default defineConfig({
  site: 'https://ops-handbook-dvp.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    // Astro 7's Sätteri processor — our hast plugin runs after syntax
    // highlighting and before heading IDs and image markers, for both
    // .md and .mdx content.
    processor: satteri({
      hastPlugins: [contentBlockDirection],
    }),
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