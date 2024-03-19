"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = require("fs");
function readKeypair(keypairFilePath) {
    const arr = JSON.parse((0, fs_1.readFileSync)(keypairFilePath).toString());
    return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(arr));
}
function getAuthorityKeypair(environment) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Local:
            return readKeypair("keys/localnet.json");
        case formfunction_program_shared_1.Environment.Testnet:
            return readKeypair("keys/testnet/deployer-keypair.json");
        case formfunction_program_shared_1.Environment.Development:
            return readKeypair("keys/devnet/deployer-keypair.json");
        case formfunction_program_shared_1.Environment.Production: {
            throw new Error(`Please provide a mainnet keypair in ${getAuthorityKeypair.name} and remove this error.`);
            return readKeypair("keys/mainnet/keypair.json");
        }
        default: {
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
        }
    }
}
exports.default = getAuthorityKeypair;
//# sourceMappingURL=getAuthorityKeypair.js.map