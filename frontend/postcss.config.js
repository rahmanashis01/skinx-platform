export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'oklab-function': { preserve: false },
        'color-function': { preserve: false },
      },
      browsers: 'last 2 versions',
    },
    autoprefixer: {},
  },
}
