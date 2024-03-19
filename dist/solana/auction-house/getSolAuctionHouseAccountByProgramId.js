"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const AuctionHouseProgramId_1 = __importDefault(require("types/enum/AuctionHouseProgramId"));
/**
 * In some cases, we (mistakenly) use the auction house account key as one of the
 * seeds for a PDA (e.g., last_bid_price) but we want to maintain the
 * same PDA across auction houses. For these cases, we use the following helper
 * to fix the auction house account key.
 */
function getSolAuctionHouseAccountByProgramId(programId) {
    const programIdString = programId.toString();
    switch (programIdString) {
        case AuctionHouseProgramId_1.default.Mainnet:
            return new web3_js_1.PublicKey("u5pLTMPar2nvwyPPVKbJ3thqfv7hPADdn3eR8zo1Q2M");
        case AuctionHouseProgramId_1.default.Devnet:
            return new web3_js_1.PublicKey("DJ117NHZaXzpKQ5VwHzQBGzJYKwRT6vaxWd2q39gkXxN");
        case AuctionHouseProgramId_1.default.Testnet:
            return new web3_js_1.PublicKey("BnYmzPQitxZ3Q736LrC25bcvBN8hPLth1q3z4JJxyY7s");
        case AuctionHouseProgramId_1.default.Localnet:
            return new web3_js_1.PublicKey("8nEg1EYQ24mvy8fkKbS7kje6rsfBKY1cZ8CyWBoL57QA");
        default:
            throw new Error(`Unrecognized program ID ${programIdString}`);
    }
}
exports.default = getSolAuctionHouseAccountByProgramId;
//# sourceMappingURL=getSolAuctionHouseAccountByProgramId.js.map