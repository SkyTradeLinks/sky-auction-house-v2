"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const parseEnvironmentArg_1 = __importDefault(require("address-lookup-table/utils/parseEnvironmentArg"));
const yargs_1 = __importDefault(require("yargs"));
function parseScriptArgs() {
    const { environment, saveTableAddressFilename, tableAddress } = (0, yargs_1.default)(process.argv.slice(2))
        .options({
        environment: {
            default: "devnet",
            type: "string",
        },
        saveTableAddressFilename: {
            type: "string",
        },
        tableAddress: {
            type: "string",
        },
    })
        .parseSync();
    const tableAddressPublicKey = (0, formfunction_program_shared_1.stringToPublicKey)(tableAddress);
    if (tableAddress != null && tableAddressPublicKey == null) {
        throw new Error(`Invalid tableAddress provided, must be a valid PublicKey. Received: ${tableAddress}`);
    }
    return {
        environment: (0, parseEnvironmentArg_1.default)(environment),
        saveTableAddressFilename,
        tableAddress: tableAddressPublicKey,
    };
}
exports.default = parseScriptArgs;
//# sourceMappingURL=parseScriptArgs.js.map