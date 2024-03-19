"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESS_LOOKUP_TABLE_MAINNET = exports.ADDRESS_LOOKUP_TABLE_DEVNET = exports.ADDRESS_LOOKUP_TABLE_TESTNET = void 0;
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
exports.ADDRESS_LOOKUP_TABLE_TESTNET = new web3_js_1.PublicKey("6cqjCGDNpwqf2Uz1QW9SCiusDRBsCymB8WVLkfbombHu");
exports.ADDRESS_LOOKUP_TABLE_DEVNET = new web3_js_1.PublicKey("GLeSXHPHPeQ4JizrA6eCBGJGqLb34DnDUYcdhVfkqpAV");
exports.ADDRESS_LOOKUP_TABLE_MAINNET = new web3_js_1.PublicKey("7CTJMVhehAXpzEMgmfSVoiCwtLFchECGEUGRnSEkNzk2");
function getAddressLookupTableForEnvironment(environment) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Testnet:
            return exports.ADDRESS_LOOKUP_TABLE_TESTNET;
        case formfunction_program_shared_1.Environment.Local:
        case formfunction_program_shared_1.Environment.Development:
            return exports.ADDRESS_LOOKUP_TABLE_DEVNET;
        case formfunction_program_shared_1.Environment.Production:
            return exports.ADDRESS_LOOKUP_TABLE_MAINNET;
        default: {
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
        }
    }
}
exports.default = getAddressLookupTableForEnvironment;
//# sourceMappingURL=getAddressLookupTableForEnvironment.js.map