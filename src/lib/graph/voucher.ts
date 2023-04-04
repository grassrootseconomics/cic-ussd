import { GraphQLClient } from 'graphql-request';
import { logger } from '@/app';

export interface Voucher {
  demurrage_rate: number
  id: number
  location_name: string
  sink_address: string
  symbol: string
  voucher_address: string
  voucher_description: string
  voucher_name: string
}

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

export async function getActiveVouchers(graphql: GraphQLClient): Promise<Voucher[]> {
  const query = `query getActiveVouchers($active: Boolean!) {
    vouchers(where: {active: {_eq: $active}}) {
      ${voucherFields}
      }
    }`

  const variables = { active: true }

  try {
    const data = await graphql.request<{ vouchers: Voucher[] }>(query, variables)
    return data.vouchers
  } catch (error: any) {
    logger.error(`Error retrieving active vouchers: ${error.message}`)
    return []
  }
}

export async function getVouchersByAddress(graphql: GraphQLClient, address: string): Promise<Voucher | null> {
  const query = `query getVouchersByAddress($address: String!) {
    vouchers(where: {voucher_address: {_eq: $address}}) {
      ${voucherFields}
    }
  }`
  const variables = {
    address,
  }
  try {
    const data = await graphql.request<{ vouchers: Voucher[] }>(query, variables)
    return data.vouchers[0]
  } catch (error: any) {
    logger.error(`Error retrieving voucher with address ${address}: ${error.message}`)
    return null
  }
}