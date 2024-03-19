"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
function cloneKeypair(kp) {
    return web3_js_1.Keypair.fromSecretKey(kp.secretKey);
}
exports.default = cloneKeypair;
