// import App from 'next/app'
import withApollo from "next-with-apollo";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient, { InMemoryCache } from "apollo-boost";
import getConfig from "next/config";

import { AppProvider } from "~@/components/AppProvider";

const CONFIG = getConfig().publicRuntimeConfig;
const GRAPHQL_HTTP_ENDPOINT = `${CONFIG.HASURA_PUBLIC_ENDPOINT}/v1/graphql`;
const GRAPHQL_ADMIN_SECRET = CONFIG.HASURA_GRAPHQL_ADMIN_SECRET;
import NoSSR from "react-no-ssr";
const App = ({ Component, pageProps, apollo }) => (
  <NoSSR>
    <AppProvider>
      <ApolloProvider client={apollo}>
        <Component {...pageProps} />
      </ApolloProvider>
    </AppProvider>
  </NoSSR>
);

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    uri: GRAPHQL_HTTP_ENDPOINT,
    headers: {
      "x-hasura-admin-secret": GRAPHQL_ADMIN_SECRET,
    },
    cache: new InMemoryCache().restore(initialState || {}),
  });
})(App);
