import { ethers, Provider } from 'ethers';
import { cashRounding } from '@lib/ussd/utils';

export async function retrieveWalletBalance (address: string, contract: string, provider: Provider) {
  const erc20Contract = new ethers.Contract(
    contract,
    ['function balanceOf(address owner) view returns (uint256)'],
    provider
  )
  const wei = await erc20Contract.balanceOf(address)
  return cashRounding(ethers.formatUnits(wei, 6))
}
