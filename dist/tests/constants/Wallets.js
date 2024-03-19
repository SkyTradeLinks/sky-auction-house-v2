"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WALLET_SPL_TOKEN_MINT_AUTHORITY = exports.WALLET_CREATOR = exports.WALLET_SELLER = exports.WALLET_BUYER = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.WALLET_BUYER = web3_js_1.Keypair.generate();
exports.WALLET_SELLER = web3_js_1.Keypair.generate();
// BR4hwUuuwk3WBnQ9ENEbNnGoiDiup7nWgVM24cAg8xMR
exports.WALLET_CREATOR = web3_js_1.Keypair.fromSecretKey(Uint8Array.from([
    149, 171, 65, 145, 137, 246, 15, 67, 77, 137, 8, 186, 171, 154, 63, 158,
    173, 148, 6, 114, 123, 219, 133, 121, 16, 67, 82, 174, 112, 140, 131, 59,
    154, 190, 255, 183, 231, 94, 23, 233, 106, 59, 37, 170, 155, 125, 150, 112,
    115, 197, 142, 233, 199, 123, 187, 200, 203, 176, 171, 44, 200, 224, 73,
    196,
]));
exports.WALLET_SPL_TOKEN_MINT_AUTHORITY = web3_js_1.Keypair.generate();
//# sourceMappingURL=Wallets.js.map