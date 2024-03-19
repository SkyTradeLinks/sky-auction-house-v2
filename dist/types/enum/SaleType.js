"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Keep in sync with TradeStateSaleType in programs/formfn-auction-house/src/lib.rs
var SaleType;
(function (SaleType) {
    SaleType[SaleType["Auction"] = 1] = "Auction";
    SaleType[SaleType["InstantSale"] = 2] = "InstantSale";
    SaleType[SaleType["Offer"] = 3] = "Offer";
})(SaleType || (SaleType = {}));
exports.default = SaleType;
//# sourceMappingURL=SaleType.js.map