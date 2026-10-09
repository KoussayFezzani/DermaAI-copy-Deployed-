/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['Lexend', 'Inter', 'sans-serif'],
                mono:  ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                /* Vichy Brand Palette */
                primary: {
                    DEFAULT: '#05AD98',
                    hover:   '#048a79',
                    light:   '#3dc9b8',
                    50:  '#E6F8F6',
                    100: '#C0EDE9',
                    200: '#80DBD3',
                    300: '#3dc9b8',
                    400: '#05AD98',
                    500: '#048a79',
                    600: '#036b5e',
                    700: '#024d44',
                },
                /* Vichy Greys */
                vichy: {
                    silver: '#BBBFBF',
                    grey:   '#878787',
                    white:  '#FFFFFF',
                    light:  '#F7F8F8',
                },
                'brand-ai': {
                    DEFAULT: '#05AD98',
                    dark:    '#3dc9b8',
                },
                severity: {
                    low:      '#05AD98',
                    'low-bg': '#E6F8F6',
                    watch:    '#B45309',
                    'watch-bg': '#FFF3E0',
                    high:     '#B83232',
                    'high-bg':'#FDECEC',
                    critical: '#7B1FA2',
                    'critical-bg': '#F3E8FB',
                },
            },
            animation: {
                'fade-in':  'fadeIn 0.7s ease-in-out forwards',
                'zoom-in':  'zoomIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float':    'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                zoomIn: {
                    '0%':   { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%':   { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%':      { transform: 'translateY(-15px)' },
                },
            },
        },
    },
    plugins: [],
}
