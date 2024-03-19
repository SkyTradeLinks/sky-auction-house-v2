"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuctionHouse_1 = require("idl/AuctionHouse");
function getErrorCodeFromErrorName(errorName) {
    const errors = AuctionHouse_1.IDL["errors"];
    const idlError = errors.find((error) => error.name === errorName);
    if (idlError == null) {
        throw new Error(`Couldn't find ${errorName} in IDL errors.`);
    }
    return idlError.code;
}
exports.default = getErrorCodeFromErrorName;
//# sourceMappingURL=getErrorCodeFromErrorName.js.map