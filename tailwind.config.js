module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Adjust these paths if needed
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    // Add other paths where you use Tailwind classes
  ],
  safelist: [
    'text-3xl',
    'font-bold',
    'mt-10',
    'mb-5',
    'text-transparent',
    'bg-clip-text',
    'bg-gradient-to-r',
    'from-green-logo/50', // Or use patterns
    'to-green-logo',
    'scroll-mt-16',
    'leading-relaxed',
    'text-gray-300',
    'text-gray-100',
    'list-disc',
    'pl-6',
    'space-y-2',
    'text-brand-green',
    'hover:text-white',
    'hover:underline',
    'transition-colors',
    'duration-300',
    'border-l-4',
    'border-brand-green/50',
    'pl-4',
    'py-3',
    'my-6',
    'italic',
    'text-gray-400',
    'bg-gray-800/30',
    'rounded-r-md',
    'shadow-sm',
    'list-decimal',
    'text-2xl',
    'font-semibold',
    'mt-8',
    'mb-4',
    'from-green-logo/90',
    'to-green-logo/80',
    // You might use patterns for colors/spacing if applicable:
    // { pattern: /text-(red|green|blue)-(100|500|700)/ },
    // { pattern: /mt-(4|8|10)/ },
  ],
  theme: {
    extend: {
        colors: {
            // Ensure green-logo is defined correctly
            'green-logo': 'var(--green-logo)', // Use the CSS variable
            'brand-green': 'var(--green-logo)',
            gray: {
              800: '#1e1e2d',
              700: '#2a2a3c',
              600: '#3e3e5b',
            },
        },
    },
  },
  plugins: [
    import('tailwindcss-animate'), // Use require for CJS config
    import('@tailwindcss/typography'),
  ],
}