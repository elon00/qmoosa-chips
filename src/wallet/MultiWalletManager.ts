/**
 * MultiWalletManager.ts
 * Multi-chain & Fiat Wallet Connector Manager
 * Supports ICP (Internet Identity, Plug, NFID), EVM (MetaMask), Solana (Phantom), and ckBTC.
 */

export type WalletType = 'internet-identity' | 'plug' | 'nfid' | 'metamask' | 'phantom' | 'ckbtc';

export interface WalletState {
  type: WalletType;
  name: string;
  icon: string;
  connected: boolean;
  address: string;
  balance: string;
  network: string;
  currency: string;
}

export class MultiWalletManager {
  private wallets: Map<WalletType, WalletState> = new Map();
  private activeWalletType: WalletType = 'internet-identity';
  private listeners: ((wallets: WalletState[], active: WalletState) => void)[] = [];

  constructor() {
    this.initWallets();
  }

  private initWallets() {
    const list: WalletState[] = [
      {
        type: 'internet-identity',
        name: 'Internet Identity (ICP)',
        icon: '🛡️',
        connected: true,
        address: 'mng5q-4aaaa-aaaah-qcjbq-cai',
        balance: '142.85 ICP',
        network: 'Internet Computer Mainnet',
        currency: 'ICP'
      },
      {
        type: 'plug',
        name: 'Plug Wallet',
        icon: '🔌',
        connected: false,
        address: 'e2f187a4192bc9da8debc81e3a6ef0e1215b4971c5ef941165bcba1198bf681c',
        balance: '48.20 ICP',
        network: 'ICP Canister Mesh',
        currency: 'ICP'
      },
      {
        type: 'nfid',
        name: 'NFID Vault',
        icon: '🔑',
        connected: false,
        address: 'nfid-principal-3981-a88b',
        balance: '95.00 ICP',
        network: 'ICP Identity Anchor',
        currency: 'ICP'
      },
      {
        type: 'metamask',
        name: 'MetaMask (EVM)',
        icon: '🦊',
        connected: false,
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        balance: '3.45 ETH ($9,120)',
        network: 'Ethereum Mainnet',
        currency: 'ETH'
      },
      {
        type: 'phantom',
        name: 'Phantom (Solana)',
        icon: '👻',
        connected: false,
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        balance: '45.80 SOL ($6,420)',
        network: 'Solana Mainnet-Beta',
        currency: 'SOL'
      },
      {
        type: 'ckbtc',
        name: 'Chain-Key Bitcoin (ckBTC)',
        icon: '₿',
        connected: false,
        address: 'mxzlk-byaaa-aaaar-qadaq-cai',
        balance: '0.142 ckBTC',
        network: 'ICP Native Bitcoin',
        currency: 'ckBTC'
      }
    ];

    list.forEach(w => this.wallets.set(w.type, w));
  }

  public getWallets(): WalletState[] {
    return Array.from(this.wallets.values());
  }

  public getActiveWallet(): WalletState {
    return this.wallets.get(this.activeWalletType)!;
  }

  public setActiveWallet(type: WalletType) {
    if (this.wallets.has(type)) {
      this.activeWalletType = type;
      this.notify();
    }
  }

  public toggleConnect(type: WalletType) {
    const w = this.wallets.get(type);
    if (w) {
      w.connected = !w.connected;
      if (w.connected) {
        this.activeWalletType = type;
      }
      this.notify();
    }
  }

  public subscribe(cb: (wallets: WalletState[], active: WalletState) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const wallets = this.getWallets();
    const active = this.getActiveWallet();
    this.listeners.forEach(l => l(wallets, active));
  }
}
