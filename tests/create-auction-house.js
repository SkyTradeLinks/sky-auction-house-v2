"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const anchor = __importStar(require("@coral-xyz/anchor"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../sdk/utils/constants");
const auction_house_sdk_1 = require("../sdk/auction-house-sdk");
describe("create-auction-house", () => __awaiter(void 0, void 0, void 0, function* () {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.AuctionHouse;
    let auctionHouseSdk;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        auctionHouseSdk = yield auction_house_sdk_1.AuctionHouseSdk.getInstance(program, provider);
    }));
    // 1% goes to authority
    const listingFeePercent = (1 / 100) * 100;
    const subsequentListingFeePercent = (1 / 100) * 100;
    const requiresSignOff = true;
    const canChangeSalePrice = false;
    const payAllFees = true;
    it("should not fetch auction house", () => __awaiter(void 0, void 0, void 0, function* () {
        // will pass if it exists as it's on devnet
        try {
            yield program.account.auctionHouse.fetch(auctionHouseSdk.auctionHouse);
        }
        catch (err) {
            if (err.message.includes("does not exist")) {
                // passes
                return;
            }
            throw err;
        }
    }));
    it("should create auction house if it doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield program.account.auctionHouse.fetch(auctionHouseSdk.auctionHouse);
        }
        catch (err) {
            if (err.message.includes("does not exist")) {
                const withdrawalDestinationAta = yield (0, spl_token_1.getAssociatedTokenAddress)(auctionHouseSdk.mintAccount, constants_1.auctionHouseAuthority.publicKey);
                yield program.methods
                    .createAuctionHouse(auctionHouseSdk.auctionHouseBump, auctionHouseSdk.feeBump, auctionHouseSdk.treasuryBump, listingFeePercent, requiresSignOff, canChangeSalePrice, subsequentListingFeePercent, payAllFees)
                    .accounts({
                    treasuryMint: auctionHouseSdk.mintAccount,
                    payer: constants_1.auctionHouseAuthority.publicKey,
                    authority: constants_1.auctionHouseAuthority.publicKey,
                    feeWithdrawalDestination: constants_1.auctionHouseAuthority.publicKey,
                    treasuryWithdrawalDestination: withdrawalDestinationAta,
                    treasuryWithdrawalDestinationOwner: constants_1.auctionHouseAuthority.publicKey,
                    auctionHouse: auctionHouseSdk.auctionHouse,
                    auctionHouseFeeAccount: auctionHouseSdk.feeAccount,
                    auctionHouseTreasury: auctionHouseSdk.treasuryAccount,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    ataProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                })
                    .signers([constants_1.auctionHouseAuthority])
                    .rpc();
                return;
            }
            throw err;
        }
    }));
}));
