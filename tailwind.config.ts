import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#063665',
          50: '#E6EBF0',
          100: '#CCD7E1',
          700: '#042441',
          800: '#031829',
          900: '#020F1A',
        },
        orange: {
          DEFAULT: '#F58A07',
          50: '#FEF3E7',
          600: '#C46E06',
          700: '#935305',
        },
        yellow: {
          DEFAULT: '#FFCE00',
          50: '#FFF9E6',
        },
      },
      fontFamily: {
        heading: ['Walter', 'serif'],
        body: ['Termina', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
export default config
