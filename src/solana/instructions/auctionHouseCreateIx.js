"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
function auctionHouseCreateIx({ program, authority, auctionHouse, treasuryMint, payer, feeWithdrawalDestination, treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, feeAccount, treasuryAccount, }, { auctionHouseBump, feeBump, treasuryBump, basisPoints, requiresSignOff, canChangePrice, basisPointsSecondary, payAllFees, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return program.methods
            .createAuctionHouse(auctionHouseBump, feeBump, treasuryBump, basisPoints, requiresSignOff, canChangePrice, basisPointsSecondary, payAllFees)
            .accounts({
            ataProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            auctionHouseTreasury: treasuryAccount,
            authority,
            feeWithdrawalDestination,
            payer,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            treasuryMint,
            treasuryWithdrawalDestination,
            treasuryWithdrawalDestinationOwner,
        })
            .instruction();
    });
}
exports.default = auctionHouseCreateIx;
