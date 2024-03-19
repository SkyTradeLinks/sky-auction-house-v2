"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const getRpcFromEnvironment_1 = __importDefault(require("address-lookup-table/utils/getRpcFromEnvironment"));
const parseScriptArgs_1 = __importDefault(require("address-lookup-table/utils/parseScriptArgs"));
function getEnvironmentAndConnectionForScript() {
    const { environment } = (0, parseScriptArgs_1.default)();
    const connection = new web3_js_1.Connection((0, getRpcFromEnvironment_1.default)(environment), "processed");
    return { connection, environment };
}
exports.default = getEnvironmentAndConnectionForScript;
//# sourceMappingURL=getEnvironmentAndConnectionForScript.js.map