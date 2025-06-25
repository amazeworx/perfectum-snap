import type { Config } from 'tailwindcss';
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
	default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

export default {
	darkMode: ['class'],
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				body: [
					'Inter',
					'sans-serif'
				],
				headline: [
					'Inter',
					'sans-serif'
				],
				code: [
					'monospace'
				]
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				fadeOut: {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'slide-in-from-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'star-movement-bottom': {
					'0%': {
						transform: 'translate(0%, 0%)',
						opacity: '1'
					},
					'100%': {
						transform: 'translate(-100%, 0%)',
						opacity: '0'
					}
				},
				'star-movement-top': {
					'0%': {
						transform: 'translate(0%, 0%)',
						opacity: '1'
					},
					'100%': {
						transform: 'translate(100%, 0%)',
						opacity: '0'
					}
				},
				// 'bounce-slow': {
				// 	'0%': {
				// 		transform: 'translateY(1px)',
				// 		'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)'
				// 	},
				// 	'50%': {
				// 		transform: 'translateY(-5px)',
				// 		'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
				// 	},
				// 	'100%': {
				// 		transform: 'translateY(1px)',
				// 		'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)'
				// 	},
				// },
				'bounce-slow': {
					'0%': {
						transform: 'translateY(1px)',
						//'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(-5px)',
						//'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
					},
					'100%': {
						transform: 'translateY(1px)',
						//'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)'
					},
				},
				aurora: {
					from: {
						backgroundPosition: "50% 50%, 50% 50%",
					},
					to: {
						backgroundPosition: "350% 50%, 350% 50%",
					},
				},
				ping: {
					'75%': {
						transform: 'scale(1.5)',
						opacity: '0',
					},
					'100%': {
						transform: 'scale(1.5)',
						opacity: '0',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-out forwards',
				'fade-out': 'fadeOut 0.3s ease-in forwards',
				'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
				'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
				'star-movement-top': 'star-movement-top linear infinite alternate',
				//'bounce-slow': '2s ease 0s infinite normal none running bounce-slow',
				'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
				'aurora': "aurora 60s linear infinite",
				'ping': "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
			},
		}
	},
	plugins: [require('tailwindcss-animated'), addVariablesForColors],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
	let allColors = flattenColorPalette(theme("colors"));
	let newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
	);

	addBase({
		":root": newVars,
	});
}