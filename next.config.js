require("./dotenv.config");
// const withPurgeCss = require("next-purgecss");
const withSass = require("@zeit/next-sass");
const customConfig = {
  publicRuntimeConfig: {
    HASURA_ENDPOINT: process.HASURA_ENDPOINT,
    HASURA_PUBLIC_ENDPOINT: process.env.HASURA_PUBLIC_ENDPOINT,
    HASURA_GRAPHQL_ADMIN_SECRET: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    API_INTERFACE_ENDPOINT: process.env.API_INTERFACE_ENDPOINT,
  },
};
// const withCSS = require("@zeit/next-css");
const defaultConfig = {
  ...customConfig,
  webpack: (config) => {
    config.node = {
      fs: "empty",
    };
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: "url-loader",
        options: {
          limit: 100000,
          name: "[name].[ext]",
        },
      },
    });
    return config;
  },
};
module.exports = withSass(defaultConfig);
