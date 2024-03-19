"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
const Currency_1 = __importDefault(require("address-lookup-table/types/Currency"));
// Lifted from formfn-monorepo.
function getAuctionHouseAccountKeyForCurrency(environment, currency) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Production:
            switch (currency) {
                case Currency_1.default.Bonk:
                    return new web3_js_1.PublicKey("CfyQQDi7hhAgnQVgXyMTTTBV2nEt8TbPkgLMbM6G5GEV");
                case Currency_1.default.Solana:
                    return new web3_js_1.PublicKey("u5pLTMPar2nvwyPPVKbJ3thqfv7hPADdn3eR8zo1Q2M");
                case Currency_1.default.UsdCoin:
                    return new web3_js_1.PublicKey("3TPU8SuKEghJgE1EBcbZgVfQKAFoAPkc1NfHDZYJyF77");
                case Currency_1.default.FamousFoxFederation:
                    return new web3_js_1.PublicKey("4QZDroaPxHMJmR3ByWHz1QeLAkSRC68gQ2u4G3wrtd2T");
                case Currency_1.default.Particles:
                    return new web3_js_1.PublicKey("HtsczT1hN9SdPPiLCt8k8dRUhPLhqc3tcSMu4n6uYFw2");
                case Currency_1.default.SkeletonCrew:
                    return new web3_js_1.PublicKey("GVoQ2aXF4beQwc2AmPJyiSKcaHbyphn1GsPD43yyxPtx");
                default:
                    return (0, formfunction_program_shared_1.assertUnreachable)(currency);
            }
        // This is the auction house address which is typically created in the SDK
        // test setup when running local SDK tests.
        case formfunction_program_shared_1.Environment.Local:
            return new web3_js_1.PublicKey("8nEg1EYQ24mvy8fkKbS7kje6rsfBKY1cZ8CyWBoL57QA");
        // NOTE: for all other environments, we just use the same auction house
        // for SPL tokens as they have no practical difference.
        case formfunction_program_shared_1.Environment.Development:
            switch (currency) {
                case Currency_1.default.Solana:
                    return new web3_js_1.PublicKey("DJ117NHZaXzpKQ5VwHzQBGzJYKwRT6vaxWd2q39gkXxN");
                case Currency_1.default.Bonk:
                case Currency_1.default.UsdCoin:
                case Currency_1.default.FamousFoxFederation:
                case Currency_1.default.Particles:
                case Currency_1.default.SkeletonCrew:
                    return new web3_js_1.PublicKey("CXfjR5HG27MWd33xM753QmEFbNbbqUphqNPSL32ayJcs");
                default:
                    return (0, formfunction_program_shared_1.assertUnreachable)(currency);
            }
        case formfunction_program_shared_1.Environment.Testnet:
            switch (currency) {
                case Currency_1.default.Solana:
                    return new web3_js_1.PublicKey("BnYmzPQitxZ3Q736LrC25bcvBN8hPLth1q3z4JJxyY7s");
                case Currency_1.default.Bonk:
                case Currency_1.default.UsdCoin:
                case Currency_1.default.FamousFoxFederation:
                case Currency_1.default.Particles:
                case Currency_1.default.SkeletonCrew:
                    return new web3_js_1.PublicKey("CDNhFyynrvPSDgKqttX6QoSLTAPeEbgZMG7FJSGWkaLk");
                default:
                    return (0, formfunction_program_shared_1.assertUnreachable)(currency);
            }
        default:
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
    }
}
exports.default = getAuctionHouseAccountKeyForCurrency;
//# sourceMappingURL=getAuctionHouseAccountKeyForCurrency.js.map