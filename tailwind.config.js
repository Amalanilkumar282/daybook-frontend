/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '320px',      // Small mobile phones
      'sm': '475px',      // Large mobile phones  
      'md': '640px',      // Small tablets
      'lg': '768px',      // Large tablets
      'xl': '1024px',     // Small desktop
      '2xl': '1280px',    // Large desktop
      '3xl': '1536px',    // Extra large desktop
      '4xl': '1920px',    // Ultra wide screens
    },
    extend: {
      colors: {
        // Classic Tally/Excel-style colors - Professional & Traditional
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9', 
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#334155', // Tally-style dark blue-gray
          600: '#1e293b',
          700: '#0f172a',
          800: '#020617',
          900: '#0c0a09',
        },
        secondary: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c', // Warm gray similar to classic software
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        accent: {
          50: '#fefdf9',
          100: '#fef7ed',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ea580c', // Classic orange for highlights
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#059669', // Traditional accounting green
          600: '#047857',
          700: '#065f46',
          800: '#064e3b',
          900: '#022c22',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d97706', // Classic amber for warnings
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc2626', // Classic accounting red
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Tally-inspired professional colors
        tally: {
          50: '#fafafa',     // Very light background
          100: '#f4f4f5',    // Light gray background
          200: '#e4e4e7',    // Border gray
          300: '#d4d4d8',    // Inactive elements
          400: '#a1a1aa',    // Secondary text
          500: '#71717a',    // Primary text
          600: '#52525b',    // Dark text
          700: '#3f3f46',    // Headers
          800: '#27272a',    // Dark backgrounds
          900: '#18181b',    // Darkest
        },
        // Excel-style colors
        excel: {
          blue: '#217346',    // Excel's classic green-blue
          green: '#70ad47',   // Excel green
          orange: '#ff8c00',  // Excel orange
          red: '#c5504b',     // Excel red
          purple: '#7030a0',  // Excel purple
          teal: '#4f81bd',    // Excel blue
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'], // Classic Windows fonts
        display: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Courier New', 'monospace'], // Classic programming fonts
        tally: ['MS Sans Serif', 'Tahoma', 'Arial', 'sans-serif'], // Traditional business software fonts
      },
      fontSize: {
        'xxs': '0.625rem',   // 10px
        'xs': '0.75rem',     // 12px - Classic small text
        'sm': '0.875rem',    // 14px - Standard body text
        'base': '1rem',      // 16px - Base size
        'lg': '1.125rem',    // 18px - Larger text
        'xl': '1.25rem',     // 20px - Headings
        '2xl': '1.5rem',     // 24px - Large headings
        '3xl': '1.875rem',   // 30px - Main headings
        '4xl': '2.25rem',    // 36px - Page titles
      },
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '8.5': '2.125rem',   // 34px
        '9.5': '2.375rem',   // 38px
      },
      boxShadow: {
        'none': 'none',
        'classic': '1px 1px 2px rgba(0, 0, 0, 0.1)', // Classic inset shadow
        'tally': 'inset -1px -1px 1px rgba(0, 0, 0, 0.1), inset 1px 1px 1px rgba(255, 255, 255, 0.8)', // Tally-style 3D effect
        'excel': '1px 1px 3px rgba(0, 0, 0, 0.12)', // Excel-style subtle shadow
        'raised': 'inset 1px 1px 1px rgba(255, 255, 255, 0.8), inset -1px -1px 1px rgba(0, 0, 0, 0.1)', // Raised button effect
        'pressed': 'inset -1px -1px 1px rgba(255, 255, 255, 0.8), inset 1px 1px 1px rgba(0, 0, 0, 0.1)', // Pressed button effect
        'field': 'inset 1px 1px 2px rgba(0, 0, 0, 0.1)', // Input field shadow
      },
      borderRadius: {
        'none': '0',
        'xs': '1px',         // Very minimal rounding
        'sm': '2px',         // Minimal rounding  
        'md': '3px',         // Slight rounding
        'lg': '4px',         // Standard rounding
        'xl': '6px',         // Larger rounding
        '2xl': '8px',        // Large rounding
      },
      borderWidth: {
        '0': '0',
        '1': '1px',
        '1.5': '1.5px',
        '2': '2px',
        '3': '3px',
      },
      animation: {
        'none': 'none',      // Remove animations for classic feel
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        'none': 'none',      // Remove blur effects for classic look
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem', 
        '10xl': '104rem',
        'screen-2xl': '1536px',
      },
      minHeight: {
        'button': '32px',    // Minimum button height for accessibility
        'field': '28px',     // Minimum field height
        'row': '24px',       // Minimum table row height
      },
      gridTemplateColumns: {
        'form': '150px 1fr',              // Label and field columns
        'table': 'repeat(auto-fit, minmax(120px, 1fr))', // Responsive table columns
        'sidebar': '250px 1fr',           // Sidebar layout
        'dashboard': 'repeat(auto-fit, minmax(280px, 1fr))', // Dashboard cards
      },
    },
  },
  plugins: [],
}
