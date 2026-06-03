const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      browsers: "ios_saf >= 10",
      features: {
        "cascade-layers": true,
        "oklab-function": { preserve: false }
      }
    }
  },
};

export default config;
