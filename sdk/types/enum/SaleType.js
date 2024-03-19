"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SaleType;
(function (SaleType) {
    SaleType[SaleType["Auction"] = 1] = "Auction";
    SaleType[SaleType["InstantSale"] = 2] = "InstantSale";
    SaleType[SaleType["Offer"] = 3] = "Offer";
})(SaleType || (SaleType = {}));
exports.default = SaleType;
