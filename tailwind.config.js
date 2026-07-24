/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lighthouse: {
          50: '#FFF4EC',
          100: '#FFE3CC',
          300: '#FFB27A',
          500: '#FF7A45',
          600: '#EA5A1E',
          700: '#B83A0A',
        },
        ocean: {
          50: '#FFF1F0',
          300: '#FFA39C',
          500: '#FF4D5E',
          700: '#CC2E3F',
          900: '#7A1822',
        },
        coral: {
          300: '#FFB3B8',
          500: '#FF4D6A',
          600: '#E8334F',
        },
        lavender: {
          100: '#FFEEE2',
          300: '#FFC08F',
          500: '#FF7A45',
          700: '#C8410A',
        },
        mint: {
          300: '#A7F3D0',
          500: '#10B981',
          700: '#047857',
        },
        cream: '#FAF7F2',
        paper: '#FFFFFF',
        ink: {
          100: '#F3F0EA',
          300: '#A39D92',
          600: '#4A4338',
          900: '#0E0B08',
        },
        night: {
          900: '#0E0B08',
          800: '#1A1612',
          700: '#2A231C',
          500: '#5C5448',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        bengali: ['Hind Siliguri', 'sans-serif'],
        korean: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-l': ['1.75rem', { lineHeight: '1.15' }],
        title: ['1.25rem', { lineHeight: '1.25', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        micro: ['0.6875rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        sm: '12px',
        card: '22px',
        hero: '28px',
        capsule: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14, 11, 8, 0.04), 0 4px 14px rgba(14, 11, 8, 0.04)',
        medium: '0 8px 24px rgba(234, 90, 30, 0.14), 0 2px 6px rgba(14, 11, 8, 0.05)',
        floating: '0 20px 50px rgba(14, 11, 8, 0.10), 0 8px 18px rgba(14, 11, 8, 0.06)',
      },
      spacing: {
        'safe-bottom': 'max(16px, env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [],
};
