import React from "react";
import SearchEbay from "../interface/App";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { CS_CONFIG } from "~@/utils";
const GRAPHQL_HTTP_ENDPOINT = `${CS_CONFIG.HASURA_PUBLIC_ENDPOINT}/v1/graphql`;
const GRAPHQL_ADMIN_SECRET = CS_CONFIG.HASURA_GRAPHQL_ADMIN_SECRET;

const client = new ApolloClient({
  uri: GRAPHQL_HTTP_ENDPOINT,
  headers: {
    "x-hasura-admin-secret": GRAPHQL_ADMIN_SECRET,
  },
});

export default () => {
  return (
    <ApolloProvider client={client}>
      <SearchEbay />
    </ApolloProvider>
  );
};
