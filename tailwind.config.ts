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
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#c8f560',
          400: '#b8f12d',
          500: '#c6f221',
          600: '#9ec418',
          700: '#769312',
          800: '#1e3a2f',
          900: '#1a332a',
        },
        secondary: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#c8f560',
          400: '#b8f12d',
          500: '#c6f221',
          600: '#9ec418',
          700: '#769312',
          800: '#1e3a2f',
          900: '#1a332a',
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#c8f560',
          400: '#c6f221',
          500: '#b8f12d',
          600: '#9ec418',
          700: '#769312',
          800: '#5a7010',
          900: '#3d4b0d',
        },
        turquoise: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#d9f99d',
          300: '#c8f560',
          400: '#c6f221',
          500: '#b8f12d',
          600: '#9ec418',
          700: '#2d4a3e',
          800: '#1e3a2f',
          900: '#1a332a',
        },
        navy: {
          500: '#2d4a3e',
          600: '#264136',
          700: '#1e3a2f',
          800: '#1a332a',
          900: '#152b23',
        },
        card: {
          yellow: '#c6f221',
          green: '#b8f12d',
          pink: '#d9f99d',
          blue: '#ecfccb',
        },
      },
    },
  },
  plugins: [],
}
export default config
