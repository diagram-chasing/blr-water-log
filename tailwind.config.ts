import type { Config } from 'tailwindcss';
import svelteUx from 'svelte-ux/plugins/tailwind.cjs';
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/svelte-ux/**/*.{svelte,js}'
  ],

  theme: {
    extend: {
      fontFamily: {
        khand: ['Khand-Regular', 'sans-serif'],
        'khand-medium': ['Khand-Medium', 'sans-serif'],
        'khand-bold': ['Khand-Bold', 'sans-serif'],
        supreme: ['Supreme-Regular', 'sans-serif']
      }
    }
  },
  ux: {
    themes: {
      light: {
        primary: 'hsl(15, 55.6%, 52.4%)',
        'primary-content': 'hsl(0, 0%, 100%)',
        secondary: 'hsl(210, 74.8%, 57%)',

        'color-scheme': 'light'
      }
    }
  },
  plugins: [svelteUx]
} as Config;
