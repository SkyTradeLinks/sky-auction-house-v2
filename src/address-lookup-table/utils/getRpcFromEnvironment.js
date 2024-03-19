"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
function getRpcFromEnvironment(environment) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Local:
            return "http://localhost:8899";
        case formfunction_program_shared_1.Environment.Testnet:
            return "https://api.testnet.solana.com";
        case formfunction_program_shared_1.Environment.Development:
            return "https://api.devnet.solana.com";
        case formfunction_program_shared_1.Environment.Production:
            return "https://api.mainnet-beta.solana.com";
        default: {
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
        }
    }
}
exports.default = getRpcFromEnvironment;
