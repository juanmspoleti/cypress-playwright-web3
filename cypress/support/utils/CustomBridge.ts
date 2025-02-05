import EventEmitter from "events"

import { ethers, ErrorCode, getAddress, parseUnits, getBigInt } from "ethers"

import { getNetwork, type INetwork } from "./contractsData"

interface Permission {
  invoker: string
  parentCapability: string
  caveats: Caveat[]
}

interface Caveat {
  type: string
  value: any
}

// Store for granted permissions
const permissionsStore: Record<string, Permission[]> = {}

export class CustomBridge extends EventEmitter {
  signer: ethers.Signer

  provider: ethers.Provider

  wallet: ethers.Wallet

  constructor(wallet: ethers.Wallet, provider: ethers.Provider = ethers.getDefaultProvider()) {
    super()

    this.wallet = wallet
    this.signer = wallet
    this.provider = provider
  }

  private shouldFailTransaction: boolean = false

  public async getTransactionCount(): Promise<string> {
    const currentNonce = await this.provider.getTransactionCount(this.wallet.address, "pending")
    return ethers.toQuantity(currentNonce)
  }

  public async calculateFee(): Promise<ethers.FeeData> {
    return this.provider.getFeeData()
  }

  public setShouldFailTransaction(value: boolean): void {
    this.shouldFailTransaction = value
  }

  public switchNetwork(network: INetwork): void {
    const newProvider = new ethers.JsonRpcProvider(network.rpcUrl)
    const newWallet = new ethers.Wallet(this.wallet.privateKey, newProvider)
    this.wallet = newWallet
    this.signer = newWallet
    this.provider = newProvider
  }

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || [])
  }

  async sendAsync(...args: Array<any>): Promise<any> {
    return this.send(...args)
  }

  async handleRequestPermissions(params: any) {
    // Example logic: accept or modify permissions based on your implementation
    if (params && params[0]?.eth_accounts) {
      // Simulate the granting of permissions, perhaps modifying internal state
      return { eth_accounts: ["0xYourWalletAddress"] }
    } else {
      throw new Error("Invalid permissions request")
    }
  }

  async handleRevokePermissions(params: any) {
    // Example logic: revoke or modify permissions based on your implementation
    if (params && params[0]?.eth_accounts) {
      // Simulate the revocation of permissions, perhaps modifying internal state
      return { revoked: true }
    } else {
      throw new Error("Invalid permissions revocation")
    }
  }

  async send(...args: Array<any>): Promise<any> {
    const isCallbackForm = typeof args[0] === "object" && typeof args[1] === "function"
    let callback
    let method
    let params
    if (isCallbackForm) {
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    try {
      const result = await this.sendInternal(method, isCallbackForm, params)
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    } catch (error) {
      if (isCallbackForm) {
        callback(error, null)
      } else {
        throw error
      }
    }
  }

  private async sendInternal(
    method: string,
    isCallbackForm: boolean,
    params?: Array<any>
  ): Promise<any> {
    function throwUnsupported(message: string): Error {
      const errorType: ErrorCode = "UNSUPPORTED_OPERATION"
      return new Error(`${message} [${errorType}]`)
    }
    let coerce = (value: any): any => value
    if (!params) {
      params = []
    }
    const invoker = "https://de.fi"

    switch (method) {
      case "eth_gasPrice": {
        const price = (await this.provider.getFeeData()).gasPrice
        if (!price) {
          const errorType: ErrorCode = "UNKNOWN_ERROR"
          return new Error(`gasPrice from getFeeData was null. [${errorType}]`)
        }
        return ethers.toQuantity(price)
      }
      case "eth_accounts":
      case "eth_requestAccounts": {
        if (isCallbackForm) {
          return { result: [this.wallet?.address.toLowerCase()] }
        } else {
          return Promise.resolve([this.wallet?.address.toLowerCase()])
        }
      }
      case "eth_blockNumber": {
        return this.provider.getBlockNumber()
      }
      case "eth_chainId": {
        const result = await this.provider.getNetwork()
        return ethers.toQuantity(result.chainId)
      }
      case "net_version": {
        const { chainId } = await this.provider.getNetwork()

        return ethers.toQuantity(chainId)
      }
      case "eth_getBalance": {
        const result = await this.provider.getBalance(params[0], params[1])
        return ethers.toQuantity(result)
      }
      case "eth_getStorageAt": {
        return this.provider.getStorage(params[0], params[1], params[2])
      }
      case "eth_getTransactionCount": {
        const result = await this.provider.getTransactionCount(params[0], params[1])
        return ethers.toQuantity(result)
      }
      case "eth_getBlockTransactionCountByHash":
      case "eth_getBlockTransactionCountByNumber": {
        const result = await this.provider.getBlock(params[0])

        if (!result) {
          const errorType: ErrorCode = "UNKNOWN_ERROR"
          return new Error(`Result from getBlock was null. ${params[0]} - [${errorType}]`)
        }

        return ethers.toQuantity(result.transactions.length)
      }
      case "eth_getCode": {
        const result = await this.provider.getCode(params[0], params[1])
        return result
      }
      case "eth_sendRawTransaction": {
        return this.signer.sendTransaction(params[0])
      }
      case "eth_call": {
        return this.provider.call(params[0])
      }
      case "eth_estimateGas":
      case "estimateGas": {
        if (params[1] && params[1] !== "latest") {
          throwUnsupported("estimateGas does not support blockTag")
        }

        const result = await this.provider.estimateGas(params[0])
        return result
      }

      case "eth_getBlockByHash":
      case "eth_getBlockByNumber": {
        return this.provider.getBlock(params[0])
      }
      case "eth_getTransactionByHash": {
        let attempts = 0
        while (attempts < 15) {
          try {
            const receipt = await this.provider.getTransaction(params[0])
            if (receipt) {
              return receipt
            }
          } catch (error) {
            console.error("Polling error: ", error)
          }

          await new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          attempts += 1
        }

        throw new Error("Transaction receipt not found after max attempts")
      }
      case "eth_getTransactionReceipt": {
        let attempts = 0
        while (attempts < 15) {
          try {
            const receipt = await this.provider.getTransactionReceipt(params[0])
            if (receipt) {
              return receipt
            }
          } catch (error) {
            console.error("Polling error: ", error)
          }

          await new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          attempts += 1
        }

        throw new Error("Transaction receipt not found after max attempts")
      }

      case "eth_sign": {
        if (!this.signer) {
          return throwUnsupported("eth_sign requires an account")
        }
        const address = await this.signer.getAddress()
        if (address !== getAddress(params[0])) {
          throw new Error(`account mismatch or account not found: ${params[0]}`)
        }

        return this.signer.signMessage(ethers.getBytes(params[1]))
      }

      case "personal_sign": {
        try {
          const messageHex = params[0] // The message in hex format
          const walletAddress = params[1] // The connected wallet address

          // Convert hex message to string
          const message = ethers.toUtf8String(messageHex)

          if (!this.provider) {
            throw new Error("Ethereum provider is not initialized")
          }

          // Ensure the signer matches the requested wallet address
          const signerAddress = await this.signer.getAddress()
          if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            throw new Error("Signer address does not match the requested wallet address")
          }

          // Sign the message
          const signature = await this.signer.signMessage(message)

          return signature
        } catch (error) {
          const errorType: ErrorCode = "UNKNOWN_ERROR"
          throw new Error(`Error signing message: ${error} [${errorType}]`)
        }
      }

      case "eth_sendTransaction": {
        if (!this.signer) {
          return throwUnsupported("eth_sendTransaction requires an account")
        }
        if (this.shouldFailTransaction) {
          const errorType: ErrorCode = "ACTION_REJECTED"
          return new Error(`User rejected the transaction. [${errorType}]`)
        }
        const maxFeePerGas = parseUnits("0.001000252", "gwei")
        const maxPriorityFeePerGas = maxFeePerGas
        const currentNonce = await this.getTransactionCount()

        const gasLimit = params[0].gas.gt(getBigInt("21000")) ? params[0].gas : getBigInt("21000")

        const updatedTransaction = {
          maxFeePerGas,
          maxPriorityFeePerGas,
          gasLimit,
          nonce: currentNonce,
          to: params[0].to,
          data: params[0].data,
        }

        params[0] = updatedTransaction
        const result = await this.signer.sendTransaction(params[0])
        return result.hash
      }
      case "eth_getUncleCountByBlockHash":
      case "eth_getUncleCountByBlockNumber": {
        coerce = ethers.toQuantity
        break
      }

      case "wallet_switchEthereumChain": {
        const chainId = parseInt(params[0].chainId, 16)
        try {
          const network = getNetwork(chainId.toString())

          const newProvider = new ethers.JsonRpcProvider(network.rpcUrl)
          const newWallet = new ethers.Wallet(this.wallet.privateKey, newProvider)
          this.wallet = newWallet
          this.signer = newWallet
          this.provider = newProvider

          return await this.send("eth_chainId", [])
        } catch (e: any) {
          return throwUnsupported(e.toString())
        }
      }
      case "eth_subscribe": {
        const subscriptionType = params[0]

        if (subscriptionType === "newHeads") {
          this.provider.on("block", (blockNumber: number) => {
            super.emit("newBlockHeader", { number: blockNumber })
          })

          const subscriptionId = `sub_${Date.now()}`
          return subscriptionId
        }

        return throwUnsupported(`Subscription type ${subscriptionType} is not supported`)
      }
      case "eth_unsubscribe": {
        const subscriptionId = params[0]

        this.provider.removeAllListeners("block")
        return true
      }
      case "wallet_getPermissions":
        return permissionsStore[invoker] || []

      case "wallet_requestPermissions":
        if (!params || typeof params !== "object") {
          throw new Error("Invalid parameters")
        }

        const requestedPermissions: Permission[] = Object.keys(params).map((parentCapability) => ({
          invoker,
          parentCapability,
          caveats: Object.entries(params[parentCapability]).map(([type, value]) => ({
            type,
            value,
          })),
        }))

        permissionsStore[invoker] = requestedPermissions
        return requestedPermissions

      case "wallet_revokePermissions":
        if (!params || !Array.isArray(params) || params.length === 0) {
          throw new Error("Invalid parameters")
        }

        permissionsStore[invoker] = (permissionsStore[invoker] || []).filter(
          (perm) => !params.includes(perm.parentCapability)
        )

        return true

      case "eth_getTransactionByBlockHashAndIndex":
      case "eth_getTransactionByBlockNumberAndIndex":
      case "eth_getUncleByBlockHashAndIndex":
      case "eth_getUncleByBlockNumberAndIndex":
      case "eth_newFilter":
      case "eth_newBlockFilter":
      case "eth_newPendingTransactionFilter":
      case "eth_uninstallFilter":
      case "eth_getFilterChanges":
      case "eth_getFilterLogs":
      case "eth_getLogs":
      default:
        break
    }

    // If our provider supports send, maybe it can do a better job?
    if ((<any>this.provider).send) {
      const result = await (<any>this.provider).send(method, params)
      return coerce(result)
    }

    return throwUnsupported(`unsupported method: ${method}`)
  }
}
