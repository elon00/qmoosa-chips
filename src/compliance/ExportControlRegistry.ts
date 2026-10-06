/**
 * ExportControlRegistry.ts
 * Authoritative Export Control Classification & Commercial Availability Matrix
 * Enforces US BIS (Bureau of Industry and Security), ITAR, Wassenaar, and EAR Regulations.
 */

export type CommercialAvailabilityTier =
  | 'COTS_OPEN_MARKET'          // Commercial Off-The-Shelf (consumer retail open checkout)
  | 'ENTERPRISE_KYC_REQUIRED'   // B2B enterprise vetting & Distributor agreement required
  | 'STRATEGIC_GOV_PERMIT'      // Dual-use strategic asset: BIS license / Gov authorization mandatory
  | 'SOVEREIGN_RESTRICTED';     // Non-exportable domestic state strategic asset

export interface ProductComplianceRecord {
  productId: string;
  eccn: string; // Export Control Classification Number
  regulatoryFramework: string;
  availabilityTier: CommercialAvailabilityTier;
  licenseRequirement: string;
  entityListRestricted: boolean;
  canDirectCheckout: boolean;
  complianceWarning: string;
}

export const EXPORT_CONTROL_DATABASE: Record<string, ProductComplianceRecord> = {
  'prod-origin-wukong-72': {
    productId: 'prod-origin-wukong-72',
    eccn: '4A090 / China Strategic Dual-Use',
    regulatoryFramework: 'Chinese Ministry of Commerce (MOFCOM) Catalogue of Restricted Tech',
    availabilityTier: 'SOVEREIGN_RESTRICTED',
    licenseRequirement: 'National Strategic Security Review Required (Non-exportable to US/EU NATO)',
    entityListRestricted: true,
    canDirectCheckout: false,
    complianceWarning: 'CRITICAL COMPLIANCE GATE: 72-qubit superconducting quantum computers cannot be purchased via open e-commerce. Government end-user attestation and sovereign research protocol mandatory.'
  },
  'prod-ionq-forte-enterprise': {
    productId: 'prod-ionq-forte-enterprise',
    eccn: '4A003.c / ECCN 4A090 (Quantum Computing Systems)',
    regulatoryFramework: 'US Export Administration Regulations (EAR) / Wassenaar Cat 4',
    availabilityTier: 'STRATEGIC_GOV_PERMIT',
    licenseRequirement: 'US Department of Commerce BIS Individual Validated End-User License',
    entityListRestricted: false,
    canDirectCheckout: false,
    complianceWarning: 'EXPORT CONTROLLED: Trapped-ion quantum servers with AQ >= 35 require verified US BIS export license. Commercial direct checkout is locked to escrow compliance vetting.'
  },
  'prod-qmoosa-shor256-coprocessor': {
    productId: 'prod-qmoosa-shor256-coprocessor',
    eccn: '5A002.a.1 (Information Security / Cryptography)',
    regulatoryFramework: 'NIST FIPS 204 Standard / Open Research Hardware Spec',
    availabilityTier: 'ENTERPRISE_KYC_REQUIRED',
    licenseRequirement: 'Civilian Post-Quantum Research Exemption (License Exception ENC)',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'COMPLIANCE AUDIT: Post-quantum cryptographic hardware co-processors require destination country screening under EAR ENC exception.'
  },
  'prod-spinq-gemini-desktop': {
    productId: 'prod-spinq-gemini-desktop',
    eccn: 'EAR99 (Civilian Educational NMR Equipment)',
    regulatoryFramework: 'Standard International Trade / Educational Scientific Tools',
    availabilityTier: 'COTS_OPEN_MARKET',
    licenseRequirement: 'No License Required (NLR) for educational and research institutions',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'CIVILIAN APPROVED: Room-temperature desktop 2-qubit NMR system approved for unrestricted university and developer purchase.'
  },
  'prod-apex-titan-super-laptop': {
    productId: 'prod-apex-titan-super-laptop',
    eccn: '3A090.a / 4A090 (Advanced High-Performance Compute)',
    regulatoryFramework: 'US BIS Interim Final Rule (Total Processing Performance > 4800 TPP)',
    availabilityTier: 'ENTERPRISE_KYC_REQUIRED',
    licenseRequirement: 'License Exception NAC/ACA required for exports to Macau and D:5 countries',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'DUAL-USE COMPUTE ALERT: Dual RTX 5090 configuration exceeds 4800 TPP threshold. Direct sale restricted within NATO/allied territories; re-export to restricted regions prohibited.'
  },
  'prod-kirin-quantum-neuralbook': {
    productId: 'prod-kirin-quantum-neuralbook',
    eccn: 'China Domestic Sovereign Class A',
    regulatoryFramework: 'China National Semiconductor Self-Reliance Initiative',
    availabilityTier: 'ENTERPRISE_KYC_REQUIRED',
    licenseRequirement: 'Domestic Asian Market General Distribution',
    entityListRestricted: true,
    canDirectCheckout: true,
    complianceWarning: 'DOMESTIC ASSET: Powered by 5nm multi-patterned sovereign silicon. Not subject to US export controls within Asian regional trade agreements.'
  },
  'prod-apple-m4-max-extreme': {
    productId: 'prod-apple-m4-max-extreme',
    eccn: 'EAR99 (Mass Market Commercial Consumer Electronics)',
    regulatoryFramework: 'US Commerce General Mass Market Consumer Tech',
    availabilityTier: 'COTS_OPEN_MARKET',
    licenseRequirement: 'Unrestricted Global Consumer Retail (NLR)',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'COMMERCIAL OFF-THE-SHELF: Standard consumer retail product with full global commercial availability.'
  },
  'prod-asml-highna-mirror-rig': {
    productId: 'prod-asml-highna-mirror-rig',
    eccn: '3B001.a.2 (Photolithography Metrology & Inspection Equipment)',
    regulatoryFramework: 'Wassenaar Arrangement Dual-Use & Dutch Strategic Goods Decree',
    availabilityTier: 'STRATEGIC_GOV_PERMIT',
    licenseRequirement: 'Dutch Ministry of Foreign Affairs Strategic Export Permit Mandatory',
    entityListRestricted: true,
    canDirectCheckout: false,
    complianceWarning: 'COMPLIANCE GATE: STRICT MONOPOLY RESTRICTION: ASML High-NA optical alignment tools CANNOT be sold to unverified parties. Bilateral government license required.'
  },
  'prod-neuralink-telepathy-devkit': {
    productId: 'prod-neuralink-telepathy-devkit',
    eccn: 'EAR99 / FDA IDE (Investigational Device Exemption)',
    regulatoryFramework: 'US FDA 21 CFR Part 812 & Institutional Review Board (IRB)',
    availabilityTier: 'STRATEGIC_GOV_PERMIT',
    licenseRequirement: 'Certified Neuroscience Research Protocol & IRB Authorization',
    entityListRestricted: false,
    canDirectCheckout: false,
    complianceWarning: 'INVESTIGATIONAL DEVICE: Neuralink Telepathy development systems are strictly investigational and not approved for open consumer purchase. Requires accredited institutional IRB credentials.'
  },
  'prod-fips204-pqc-hsm': {
    productId: 'prod-fips204-pqc-hsm',
    eccn: '5A002.a (Mass Market Cryptographic Hardware)',
    regulatoryFramework: 'NIST FIPS 204 / FIPS 140-3 Cryptographic Module',
    availabilityTier: 'COTS_OPEN_MARKET',
    licenseRequirement: 'NLR - License Exception ENC Mass Market',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'COMMERCIAL PQC KEY: Unrestricted civilian commercial availability for secure enterprise authentication.'
  },
  'prod-300mm-wafer-foup': {
    productId: 'prod-300mm-wafer-foup',
    eccn: 'EAR99 (Semiconductor Fab Consumables & Cleanroom Automation)',
    regulatoryFramework: 'SEMI Standards (SEMI E47.1)',
    availabilityTier: 'ENTERPRISE_KYC_REQUIRED',
    licenseRequirement: 'Standard Industrial B2B Terms',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'FAB LOGISTICS: Available to commercial semiconductor cleanrooms and universities.'
  },
  'prod-dilution-cryo-cables': {
    productId: 'prod-dilution-cryo-cables',
    eccn: '3A001.a.13 (Superconducting RF Coaxial Cable Assemblies)',
    regulatoryFramework: 'Wassenaar Dual-Use Category 3',
    availabilityTier: 'ENTERPRISE_KYC_REQUIRED',
    licenseRequirement: 'Commercial Research End-User Undertaking (EUU)',
    entityListRestricted: false,
    canDirectCheckout: true,
    complianceWarning: 'SCIENTIFIC RF COMPONENT: Requires end-user declaration confirming cryogenic quantum laboratory usage.'
  }
};
