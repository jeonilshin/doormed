import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f5',
          100: '#ccefeb',
          200: '#99dfd7',
          300: '#66cfc3',
          400: '#33bfaf',
          500: '#00af9b',
          600: '#008c7c',
          700: '#00695d',
          800: '#00463e',
          900: '#00231f',
        },
        secondary: {
          50: '#e8f4fc',
          100: '#d1e9f9',
          200: '#a3d3f3',
          300: '#75bded',
          400: '#47a7e7',
          500: '#1991e1',
          600: '#1474b4',
          700: '#0f5787',
          800: '#0a3a5a',
          900: '#051d2d',
        },
      },
    },
  },
  plugins: [],
}
export default config
