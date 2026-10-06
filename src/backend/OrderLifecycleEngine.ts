/**
 * OrderLifecycleEngine.ts
 * Server-Side Order State Machine, Inventory Reservation & Escrow Engine
 * Replaces client-side UI simulation with formal transactional order lifecycle.
 */

import { EXPORT_CONTROL_DATABASE, type ProductComplianceRecord } from '../compliance/ExportControlRegistry.ts';
import { NistPqcEngine, type CryptographicReceipt } from '../crypto/NistPqcEngine.ts';
import marketplaceProducts from '../config/marketplace-products.json' with { type: 'json' };

export type OrderStatus =
  | 'DRAFT'
  | 'COMPLIANCE_SCREENING'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'ESCROW_LOCKED'
  | 'DISPATCHED'
  | 'FULFILLED'
  | 'CANCELLED_EXPIRED'
  | 'REJECTED_COMPLIANCE';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
}

export interface ServerOrder {
  orderId: string;
  status: OrderStatus;
  buyerRole: 'RETAIL_BUYER' | 'AUTHORIZED_DISTRIBUTOR' | 'FOUNDRY_SUPPLIER';
  payerAddress: string;
  paymentRail: string;
  items: OrderItem[];
  totalUsd: number;
  inventoryReserved: boolean;
  complianceRecord: ProductComplianceRecord;
  createdAt: string;
  expiresAtEpoch: number;
  receipt?: CryptographicReceipt;
  txHash?: string;
  rejectionReason?: string;
}

export class OrderLifecycleEngine {
  private static orders = new Map<string, ServerOrder>();
  private static inventory = new Map<string, number>();

  static {
    // Initialize authoritative inventory from catalog
    for (const p of marketplaceProducts) {
      this.inventory.set(p.id, p.stockQty);
    }
  }

  /**
   * Creates a formal order, runs compliance screening and reserves inventory
   */
  public static async createOrder(params: {
    productId: string;
    quantity: number;
    buyerRole: 'RETAIL_BUYER' | 'AUTHORIZED_DISTRIBUTOR' | 'FOUNDRY_SUPPLIER';
    payerAddress: string;
    paymentRail: string;
  }): Promise<ServerOrder> {
    const prod = marketplaceProducts.find(p => p.id === params.productId);
    if (!prod) {
      throw new Error(`Product ${params.productId} not found in authoritative catalog.`);
    }

    const compliance = EXPORT_CONTROL_DATABASE[params.productId] || {
      productId: params.productId,
      eccn: 'EAR99',
      regulatoryFramework: 'Commercial',
      availabilityTier: 'COTS_OPEN_MARKET',
      licenseRequirement: 'None',
      entityListRestricted: false,
      canDirectCheckout: true,
      complianceWarning: ''
    };

    const currentStock = this.inventory.get(params.productId) || 0;
    if (currentStock < params.quantity) {
      throw new Error(`Insufficient inventory: Requested ${params.quantity}, Available ${currentStock}`);
    }

    const unitPrice = params.buyerRole === 'AUTHORIZED_DISTRIBUTOR'
      ? prod.usaPriceUsd * (1 - prod.distributorPricing.wholesaleDiscountPercent / 100)
      : prod.usaPriceUsd;

    const totalUsd = unitPrice * params.quantity;
    const orderId = `QMOOSA-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Compliance Gate Check
    if (!compliance.canDirectCheckout && params.buyerRole === 'RETAIL_BUYER') {
      const rejectedOrder: ServerOrder = {
        orderId,
        status: 'REJECTED_COMPLIANCE',
        buyerRole: params.buyerRole,
        payerAddress: params.payerAddress,
        paymentRail: params.paymentRail,
        items: [{ productId: prod.id, quantity: params.quantity, unitPriceUsd: unitPrice, totalUsd }],
        totalUsd,
        inventoryReserved: false,
        complianceRecord: compliance,
        createdAt: new Date().toISOString(),
        expiresAtEpoch: Date.now(),
        rejectionReason: compliance.complianceWarning
      };
      this.orders.set(orderId, rejectedOrder);
      return rejectedOrder;
    }

    // Atomically reserve inventory
    this.inventory.set(params.productId, currentStock - params.quantity);

    const order: ServerOrder = {
      orderId,
      status: 'AWAITING_PAYMENT',
      buyerRole: params.buyerRole,
      payerAddress: params.payerAddress,
      paymentRail: params.paymentRail,
      items: [{ productId: prod.id, quantity: params.quantity, unitPriceUsd: unitPrice, totalUsd }],
      totalUsd,
      inventoryReserved: true,
      complianceRecord: compliance,
      createdAt: new Date().toISOString(),
      expiresAtEpoch: Date.now() + 900000 // 15 minutes TTL
    };

    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Confirms payment, locks escrow, and signs cryptographic PQC receipt
   */
  public static async confirmPayment(orderId: string, txHash: string): Promise<ServerOrder> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} does not exist.`);
    }

    if (order.status !== 'AWAITING_PAYMENT') {
      throw new Error(`Order ${orderId} is in invalid state: ${order.status}`);
    }

    // Generate genuine PQC signature using Web Crypto API
    const receipt = await NistPqcEngine.signInvoice({
      orderId: order.orderId,
      productName: order.items[0]?.productId || 'Unknown',
      amount: order.totalUsd,
      payerAddress: order.payerAddress,
      recipientAddress: 'e2f187a4192bc9da8debc81e3a6ef0e1215b4971c5ef941165bcba1198bf681c',
      paymentRail: order.paymentRail,
      eccn: order.complianceRecord.eccn
    });

    order.status = 'ESCROW_LOCKED';
    order.txHash = txHash;
    order.receipt = receipt;

    return order;
  }

  public static getOrder(orderId: string): ServerOrder | undefined {
    return this.orders.get(orderId);
  }

  public static getStock(productId: string): number {
    return this.inventory.get(productId) ?? 0;
  }
}
