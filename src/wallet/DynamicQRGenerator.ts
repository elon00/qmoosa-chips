/**
 * DynamicQRGenerator.ts
 * Dual-Rail Fiat & Crypto Dynamic QR Code Generator
 * Genuine ISO/IEC 18004 QR Code Generation with Reed-Solomon Error Correction.
 * Powered by 'qrcode' library.
 * Zero pseudo-hash bit matrices in production paths.
 */

import QRCode from 'qrcode';

export type PaymentRail = 'ICP' | 'ckBTC' | 'ETH' | 'SOL' | 'USDC' | 'UPI' | 'SEPA' | 'STRIPE';

export interface QRPayloadOptions {
  rail: PaymentRail;
  amount: number | string;
  recipient?: string;
  note?: string;
  currency?: string;
}

export interface QRResult {
  rail: PaymentRail;
  uri: string;
  displayAmount: string;
  recipientAddress: string;
  svgMatrix: boolean[][];
  matrixSize: number;
}

export class DynamicQRGenerator {
  /**
   * Builds official payment URI scheme according to chain/fiat standards
   */
  public static buildPaymentUri(opts: QRPayloadOptions): { uri: string; address: string; displayAmount: string } {
    const { rail, amount, note = 'QMoosa Silicon Litho Allocation' } = opts;

    switch (rail) {
      case 'ICP': {
        const address = opts.recipient || 'e2f187a4192bc9da8debc81e3a6ef0e1215b4971c5ef941165bcba1198bf681c';
        const uri = `icp:${address}?amount=${amount}&memo=402`;
        return { uri, address, displayAmount: `${amount} ICP` };
      }
      case 'ckBTC': {
        const address = opts.recipient || 'bc1q0m00sach1pswaferallocationeuv7nm2026';
        const uri = `bitcoin:${address}?amount=${amount}&message=${encodeURIComponent(note)}`;
        return { uri, address, displayAmount: `${amount} ckBTC` };
      }
      case 'ETH': {
        const address = opts.recipient || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        const uri = `ethereum:${address}?value=${amount}`;
        return { uri, address, displayAmount: `${amount} ETH` };
      }
      case 'SOL': {
        const address = opts.recipient || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
        const uri = `solana:${address}?amount=${amount}&label=QMoosaChips&message=${encodeURIComponent(note)}`;
        return { uri, address, displayAmount: `${amount} SOL` };
      }
      case 'USDC': {
        const address = opts.recipient || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        const uri = `ethereum:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/transfer?address=${address}&uint256=${amount}`;
        return { uri, address, displayAmount: `${amount} USDC` };
      }
      case 'UPI': {
        // India Unified Payments Interface Standard
        const vpa = opts.recipient || 'qmoosa.chips@icp';
        const uri = `upi://pay?pa=${vpa}&pn=QMoosa+Chips&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
        return { uri, address: vpa, displayAmount: `₹${amount} INR` };
      }
      case 'SEPA': {
        // European Payments Council Quick Response Code (EPC QR)
        const iban = opts.recipient || 'NL91BUNQ2051283941';
        const uri = `BCD\n002\n1\nSCT\n\nQMoosa Chips BV\n${iban}\nEUR${amount}\n\n${note}`;
        return { uri, address: iban, displayAmount: `€${amount} EUR` };
      }
      case 'STRIPE': {
        const uri = `https://checkout.caffeine.ai/pay/qmoosa-chips?amt=${amount}&curr=USD&ref=x402`;
        return { uri, address: 'Caffeine.ai Fiat Gateway', displayAmount: `$${amount} USD` };
      }
      default:
        return { uri: String(amount), address: '', displayAmount: String(amount) };
    }
  }

  /**
   * Generates a genuine ISO/IEC 18004 2D QR Code binary grid
   * Performs full mode encoding, error correction code generation (Reed-Solomon),
   * module masking, and matrix compilation.
   */
  public static generateMatrix(dataString: string): boolean[][] {
    const qr = QRCode.create(dataString, {
      errorCorrectionLevel: 'M'
    });

    const size = qr.modules.size;
    const matrix: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(qr.modules.get(r, c)));
      }
      matrix.push(row);
    }

    return matrix;
  }

  /**
   * Renders ISO/IEC 18004 QR Code as raw SVG string
   */
  public static async generateSvgString(dataString: string): Promise<string> {
    return QRCode.toString(dataString, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1
    });
  }

  /**
   * Helper to create full QR Result object
   */
  public static createQR(opts: QRPayloadOptions): QRResult {
    const { uri, address, displayAmount } = this.buildPaymentUri(opts);
    const svgMatrix = this.generateMatrix(uri);
    return {
      rail: opts.rail,
      uri,
      displayAmount,
      recipientAddress: address,
      svgMatrix,
      matrixSize: svgMatrix.length
    };
  }
}
