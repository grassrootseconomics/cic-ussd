import { GraphQLClient } from 'graphql-request';


/**
 * Description placeholder
 * @date 3/3/2023 - 10:35:45 AM
 *
 * @export
 * @interface Voucher
 * @typedef {Voucher}
 */
export interface Voucher {
  demurrage_rate: number
  id: number
  location_name: string
  sink_address: string
  symbol: Symbol
  voucher_address: string
  voucher_description: string
  voucher_name: string
}



/**
 * Fields returned by the graph for a voucher object.
 * @type {string}
 */
/**
 * Description placeholder
 * @date 3/3/2023 - 10:35:59 AM
 *
 * @type {string}
 */
export const voucherFields = `
    demurrage_rate
    geo
    id
    location_name
    sink_address
    supply
    symbol
    voucher_address
    voucher_description
    voucher_name`


/**
 * Description placeholder
 * @date 3/3/2023 - 10:37:02 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphql
 * @returns {Promise<Voucher[]>}
 */
export async function getActiveVouchers(graphql: GraphQLClient): Promise<Voucher[]> {
  const query = `query getActiveVouchers($active: Boolean!) {
    vouchers(where: {active: {_eq: $active}}) {
      ${voucherFields}
      }
    }`

    const variables = {
        active: true,
    }

    const data = await graphql.request<{ vouchers: Voucher[] }>(query, variables)
    return data.vouchers
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:36:43 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphql
 * @param {string} address
 * @returns {Promise<Voucher>}
 */
export async function getVouchersByAddress(graphql: GraphQLClient, address: string): Promise<Voucher> {
  const query = `query getVouchersByAddress($address: String!) {
    vouchers(where: {voucher_address: {_eq: $address}}) {
      ${voucherFields}
    }
  }`
  const variables = {
    address,
  }
  const data = await graphql.request<{ vouchers: Voucher[] }>(query, variables)
  return data.vouchers[0]
}

export async function getVouchersBySymbol(graphql: GraphQLClient, symbol: string): Promise<Voucher> {
  const query = `query getVouchersBySymbol($symbol: String!) {
    vouchers(where: {symbol: {_eq: $symbol}}) {
      ${voucherFields}
    }
  }`
  const variables = {
    symbol,
  }
  const data = await graphql.request<{ vouchers: Voucher[] }>(query, variables)
  return data.vouchers[0]
}

export async function getHeldVouchers(graphql: GraphQLClient, address: string): Promise<Voucher[]> {
  const query = `query getHeldVouchers($address: String!) {
    vouchers(where: {blockchain_address: {_eq: $address}}) {
      ${voucherFields}
    }
  }`
  const variables = {
    address,
  }
  const data = await graphql.request<{ vouchers: Voucher[] }>(query, variables)
  return data.vouchers
}

