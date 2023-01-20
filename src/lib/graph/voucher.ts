import { voucherFields } from "@lib/types/graph/voucher";
import { gql, GraphQLClient } from "graphql-request";

export async function getVouchers(graphqlClient: GraphQLClient) {
    const query = gql`
      query {
        vouchers(where: {active: {_eq: true}}) {
            ${voucherFields}
        }
      }`;
    return  await graphqlClient.request(query);

}


export async function getVoucherBySymbol(graphqlClient: GraphQLClient, symbol: string) {
    const query = gql`
      query {
        vouchers(where: {symbol: {_eq: "${symbol}"}}) {
            ${voucherFields}
        }
      }`;
    return  await graphqlClient.request(query);

}