"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Keep in sync with PriceFunctionType in programs/formfn-auction-house/src/lib.rs
var PriceFunctionType;
(function (PriceFunctionType) {
    PriceFunctionType[PriceFunctionType["Constant"] = 0] = "Constant";
    PriceFunctionType[PriceFunctionType["Linear"] = 1] = "Linear";
    PriceFunctionType[PriceFunctionType["Minimum"] = 2] = "Minimum";
})(PriceFunctionType || (PriceFunctionType = {}));
exports.default = PriceFunctionType;
