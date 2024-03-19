"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
function parseEnvironmentArg(environment) {
    switch (environment) {
        case "local":
            return formfunction_program_shared_1.Environment.Local;
        case "devnet":
            return formfunction_program_shared_1.Environment.Development;
        case "testnet":
            return formfunction_program_shared_1.Environment.Testnet;
        case "mainnet":
            return formfunction_program_shared_1.Environment.Production;
        default: {
            throw new Error(`Invalid environment argument supplied, received: ${environment}.`);
        }
    }
}
exports.default = parseEnvironmentArg;
