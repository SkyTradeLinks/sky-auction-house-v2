"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
const Currency_1 = __importDefault(require("address-lookup-table/types/Currency"));
// Lifted from formfn-monorepo.
function getTreasuryMintForCurrency(environment, currency) {
    // Special case, same for all environments
    if (currency === Currency_1.default.Solana) {
        return formfunction_program_shared_1.WRAPPED_SOL_MINT;
    }
    switch (environment) {
        case formfunction_program_shared_1.Environment.Production:
            switch (currency) {
                case Currency_1.default.Bonk:
                    // https://explorer.solana.com/address/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
                    return new web3_js_1.PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
                case Currency_1.default.UsdCoin:
                    // https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
                    return new web3_js_1.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
                case Currency_1.default.FamousFoxFederation:
                    // https://explorer.solana.com/address/FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq
                    return new web3_js_1.PublicKey("FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq");
                case Currency_1.default.Particles:
                    // https://explorer.solana.com/address/BDNRJZ6MA3YRhHcewYMjRDEc7oWQCxHknXU98wwTsSxu
                    return new web3_js_1.PublicKey("BDNRJZ6MA3YRhHcewYMjRDEc7oWQCxHknXU98wwTsSxu");
                case Currency_1.default.SkeletonCrew:
                    // https://explorer.solana.com/address/SKu11EypaFU3gvr8VSAbi13zEC2CPvqbz9s83N3tWHM
                    return new web3_js_1.PublicKey("SKu11EypaFU3gvr8VSAbi13zEC2CPvqbz9s83N3tWHM");
                default:
                    return (0, formfunction_program_shared_1.assertUnreachable)(currency);
            }
        // NOTE: for all environments that are not production, we just use the same
        // dummy SPL token as defined in the link below
        case formfunction_program_shared_1.Environment.Development:
        case formfunction_program_shared_1.Environment.Local:
        case formfunction_program_shared_1.Environment.Testnet:
            switch (currency) {
                case Currency_1.default.Bonk:
                case Currency_1.default.UsdCoin:
                case Currency_1.default.FamousFoxFederation:
                case Currency_1.default.Particles:
                case Currency_1.default.SkeletonCrew:
                    // https://spl-token-faucet.com/
                    return new web3_js_1.PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
                default:
                    return (0, formfunction_program_shared_1.assertUnreachable)(currency);
            }
        default:
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
    }
}
exports.default = getTreasuryMintForCurrency;
