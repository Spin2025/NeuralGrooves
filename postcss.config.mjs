/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {}, // You can also add autoprefixer if it isn't already included
  },
};

export default config;
