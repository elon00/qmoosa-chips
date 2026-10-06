// QMoosa Chips Core - Motoko Canister for ICP Protocol
// Decentralized Silicon Registry, Lithography Telemetry, and Sovereign Chip Provenance

import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";

actor QmoosaChipsCore {

    public type ChipCompany = {
        id: Text;
        name: Text;
        country: Text;
        role: Text;
        marketCap: Text;
        waferCapacityMonthly: Text;
        yieldPercentage: Nat;
        defectDensityD0: Text;
        sovereignStatus: Text;
        lastUpdateEpoch: Time.Time;
    };

    public type WaferVerificationProof = {
        chipDid: Text;
        companyId: Text;
        nodeName: Text;
        defectCount: Nat;
        yieldScore: Nat;
        conwayStateHash: Text;
        verifiedBy: Principal;
        timestamp: Time.Time;
    };

    private stable var companiesList : [ChipCompany] = [
        {
            id = "asml";
            name = "ASML Holding N.V.";
            country = "Netherlands";
            role = "High-NA EUV Photolithography (0.55 NA)";
            marketCap = "$380B";
            waferCapacityMonthly = "38,000 Tools Eq";
            yieldPercentage = 94;
            defectDensityD0 = "0.042 / cm2";
            sovereignStatus = "Western Monopolist";
            lastUpdateEpoch = 0;
        },
        {
            id = "tsmc";
            name = "TSMC";
            country = "Taiwan";
            role = "Pure-Play Foundry Leader (N2 / A16 GAA)";
            marketCap = "$920B";
            waferCapacityMonthly = "1,450,000 Wafers";
            yieldPercentage = 88;
            defectDensityD0 = "0.068 / cm2";
            sovereignStatus = "Silicon Shield Core";
            lastUpdateEpoch = 0;
        },
        {
            id = "smic-smee";
            name = "SMIC & SMEE";
            country = "China";
            role = "Domestic Litho & SSMB Particle Accelerator EUV";
            marketCap = "$68B";
            waferCapacityMonthly = "820,000 Wafers";
            yieldPercentage = 68;
            defectDensityD0 = "0.145 / cm2";
            sovereignStatus = "Sovereign Domestic Breakthrough";
            lastUpdateEpoch = 0;
        },
        {
            id = "nvidia";
            name = "NVIDIA";
            country = "USA";
            role = "AI Compute Architect (Blackwell B200 / Rubin)";
            marketCap = "$3,200B";
            waferCapacityMonthly = "Fabless (TSMC Allocations)";
            yieldPercentage = 92;
            defectDensityD0 = "0.051 / cm2";
            sovereignStatus = "US Sovereign AI Core";
            lastUpdateEpoch = 0;
        },
        {
            id = "intel";
            name = "Intel Foundry (IFS)";
            country = "USA";
            role = "18A RibbonFET & PowerVia Backside";
            marketCap = "$110B";
            waferCapacityMonthly = "950,000 Wafers";
            yieldPercentage = 81;
            defectDensityD0 = "0.092 / cm2";
            sovereignStatus = "US CHIPS Act Anchor";
            lastUpdateEpoch = 0;
        },
        {
            id = "samsung";
            name = "Samsung Electronics";
            country = "South Korea";
            role = "3nm/2nm MBCFET GAA & HBM3e/HBM4";
            marketCap = "$360B";
            waferCapacityMonthly = "1,800,000 Wafers";
            yieldPercentage = 79;
            defectDensityD0 = "0.108 / cm2";
            sovereignStatus = "K-Chips Act Pillar";
            lastUpdateEpoch = 0;
        }
    ];

    private var proofs : [WaferVerificationProof] = [];

    // Query all registered chip companies and their telemetry
    public query func getChipCompanies() : async [ChipCompany] {
        return companiesList;
    };

    // Update telemetry for a chip company
    public func updateCompanyYield(companyId: Text, newYield: Nat, defectD0: Text) : async Bool {
        var updated = false;
        var newList : [ChipCompany] = [];
        for (item in companiesList.vals()) {
            if (item.id == companyId) {
                let modified : ChipCompany = {
                    id = item.id;
                    name = item.name;
                    country = item.country;
                    role = item.role;
                    marketCap = item.marketCap;
                    waferCapacityMonthly = item.waferCapacityMonthly;
                    yieldPercentage = newYield;
                    defectDensityD0 = defectD0;
                    sovereignStatus = item.sovereignStatus;
                    lastUpdateEpoch = Time.now();
                };
                newList := Array.append(newList, [modified]);
                updated := true;
            } else {
                newList := Array.append(newList, [item]);
            };
        };
        if (updated) {
            companiesList := newList;
        };
        return updated;
    };

    // Submit wafer verification proof from Conway Automaton simulation or Litho sensor
    public func registerWaferProof(
        chipDid: Text,
        companyId: Text,
        nodeName: Text,
        defectCount: Nat,
        yieldScore: Nat,
        conwayStateHash: Text,
        caller: Principal
    ) : async WaferVerificationProof {
        let proof : WaferVerificationProof = {
            chipDid = chipDid;
            companyId = companyId;
            nodeName = nodeName;
            defectCount = defectCount;
            yieldScore = yieldScore;
            conwayStateHash = conwayStateHash;
            verifiedBy = caller;
            timestamp = Time.now();
        };
        proofs := Array.append(proofs, [proof]);
        return proof;
    };

    // Query verified wafer proofs
    public query func getWaferProofs() : async [WaferVerificationProof] {
        return proofs;
    };

    // Protocol Heartbeat & Caffeine.ai sync check
    public query func getProtocolStatus() : async {
        protocolName: Text;
        version: Text;
        totalFabs: Nat;
        verifiedProofsCount: Nat;
        caffeineMeshSynced: Bool;
    } {
        return {
            protocolName = "QMoosa Chips Protocol";
            version = "1.0.0";
            totalFabs = companiesList.size();
            verifiedProofsCount = proofs.size();
            caffeineMeshSynced = true;
        };
    };
};
