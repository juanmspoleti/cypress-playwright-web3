import networksData from "./networksData.json"

export interface INetwork {
  chainId: number
  name: string
  rpcUrl: string
}

const typedNetworksData: Record<string, INetwork> = networksData

export function getNetwork(chainId?: string): INetwork {
  const chainToUse = chainId || "11155111"
  const network = typedNetworksData[chainToUse]

  if (!network) {
    throw new Error(`Network ${chainToUse} is not supported`)
  }

  return network
}
