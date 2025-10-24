/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 2. Add all the custom colors your button component is using
      colors: {
        // This is your "bluecolor". I'm guessing it's your primary color.
        bluecolor: 'hsl(var(--primary))', 
        
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))', // This is used for focus-visible:ring-ring
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))', // Your 'text-primary-foreground'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // Your 'bg-secondary'
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // Your 'bg-destructive'
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // Your 'bg-accent'
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // 3. Make sure your border radius matches your button's "rounded-xl"
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)', // This makes 'rounded-xl' work
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // ... (other settings like keyframes for animations)
    },
  },
  plugins: [require('tailwindcss-animate')],
}
