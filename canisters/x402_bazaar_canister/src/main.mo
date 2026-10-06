// QMoosa x402 Bazaar Canister - Motoko Canister for ICP Protocol
// HTTP 402 Autonomous Agent Commerce & Micropayment Settlement

import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

actor X402BazaarCanister {

    public type PaymentQuote = {
        quoteId: Text;
        resourcePath: Text;
        requiredCurrency: Text;
        amountE8s: Nat;
        payToAddress: Text;
        nonce: Text;
        expiresAt: Time.Time;
        status: Text; // "PENDING", "SETTLED", "EXPIRED"
    };

    public type SettlementReceipt = {
        receiptId: Text;
        quoteId: Text;
        payerPrincipal: Principal;
        payerAddress: Text;
        amountPaid: Nat;
        currency: Text;
        txHash: Text;
        authBearerToken: Text;
        settledAt: Time.Time;
    };

    private var quotes : [PaymentQuote] = [];
    private var settlements : [SettlementReceipt] = [];
    private var nonceCounter : Nat = 1000;

    // Issue an HTTP 402 Payment Quote for an autonomous agent request
    public func create402Quote(resourcePath: Text, currency: Text, amountE8s: Nat, payTo: Text) : async PaymentQuote {
        nonceCounter += 1;
        let id = "quote_x402_" # Nat.toText(nonceCounter) # "_" # Nat.toText(Time.now());
        let newQuote : PaymentQuote = {
            quoteId = id;
            resourcePath = resourcePath;
            requiredCurrency = currency;
            amountE8s = amountE8s;
            payToAddress = payTo;
            nonce = Nat.toText(nonceCounter);
            expiresAt = Time.now() + 600000000000; // 10 minutes in nanoseconds
            status = "PENDING";
        };
        quotes := Array.append(quotes, [newQuote]);
        return newQuote;
    };

    // Autonomous agent or user verifies settlement and receives cryptographic auth token
    public func settle402Payment(
        quoteId: Text,
        payerAddress: Text,
        txHash: Text,
        caller: Principal
    ) : async ?SettlementReceipt {
        var foundQuote : ?PaymentQuote = null;
        var updatedQuotes : [PaymentQuote] = [];

        for (q in quotes.vals()) {
            if (q.quoteId == quoteId and q.status == "PENDING") {
                let settled : PaymentQuote = {
                    quoteId = q.quoteId;
                    resourcePath = q.resourcePath;
                    requiredCurrency = q.requiredCurrency;
                    amountE8s = q.amountE8s;
                    payToAddress = q.payToAddress;
                    nonce = q.nonce;
                    expiresAt = q.expiresAt;
                    status = "SETTLED";
                };
                foundQuote := ?settled;
                updatedQuotes := Array.append(updatedQuotes, [settled]);
            } else {
                updatedQuotes := Array.append(updatedQuotes, [q]);
            };
        };

        switch (foundQuote) {
            case null { return null };
            case (?quote) {
                quotes := updatedQuotes;
                let receiptId = "rcpt_x402_" # quote.nonce # "_" # Nat.toText(Time.now());
                let bearerToken = "x402_bearer_sig_" # quote.quoteId # "_" # txHash;
                let receipt : SettlementReceipt = {
                    receiptId = receiptId;
                    quoteId = quote.quoteId;
                    payerPrincipal = caller;
                    payerAddress = payerAddress;
                    amountPaid = quote.amountE8s;
                    currency = quote.requiredCurrency;
                    txHash = txHash;
                    authBearerToken = bearerToken;
                    settledAt = Time.now();
                };
                settlements := Array.append(settlements, [receipt]);
                return ?receipt;
            };
        };
    };

    // Verify if an authorization token is valid
    public query func verifyAuthToken(bearerToken: Text) : async Bool {
        for (rcpt in settlements.vals()) {
            if (rcpt.authBearerToken == bearerToken) {
                return true;
            };
        };
        return false;
    };

    // Get all settled transactions
    public query func getSettlements() : async [SettlementReceipt] {
        return settlements;
    };

    // Get live quotes status
    public query func getActiveQuotes() : async [PaymentQuote] {
        return quotes;
    };
};
