"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
// Must be consistent with the program proof verification amount size in bytes.
const amountNumBytes = 2;
function constructMerkleLeafNode(buyer, masterEditionMint) {
    return Buffer.from([
        ...buyer.address.toBuffer(),
        ...masterEditionMint.toBuffer(),
        ...new bn_js_1.default(buyer.amount).toArray("le", amountNumBytes),
    ]);
}
exports.default = constructMerkleLeafNode;
