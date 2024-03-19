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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = require("bn.js");
const getSellerFreeTradeState_1 = __importDefault(require("solana/auction-house/getSellerFreeTradeState"));
const getTradeState_1 = __importDefault(require("solana/auction-house/getTradeState"));
const findAuctionHouseProgramAsSigner_1 = __importDefault(require("solana/pdas/findAuctionHouseProgramAsSigner"));
function auctionHouseSellIx({ program, walletSeller, tokenAccount, feeAccount, tokenMint, priceInLamports, authority, auctionHouse, treasuryMint, auctionHouseProgramId, }, { tokenSize = 1 }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [tradeState, tradeBump, buyPriceAdjusted] = yield (0, getTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            priceInLamports,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet: walletSeller,
        });
        const [programAsSigner, programAsSignerBump] = (0, findAuctionHouseProgramAsSigner_1.default)(auctionHouseProgramId);
        const [masterEdition] = (0, formfunction_program_shared_1.findEditionPda)(tokenMint);
        const [metadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(tokenMint);
        const [freeTradeState, freeTradeBump] = yield (0, getSellerFreeTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet: walletSeller,
        });
        return program.methods
            .sell(tradeBump, freeTradeBump, programAsSignerBump, buyPriceAdjusted, new bn_js_1.BN(tokenSize))
            .accounts({
            auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            authority,
            freeSellerTradeState: freeTradeState,
            masterEdition,
            metadata,
            metaplexTokenMetadataProgram: formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID,
            programAsSigner,
            rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
            sellerTradeState: tradeState,
            systemProgram: anchor_1.web3.SystemProgram.programId,
            tokenAccount,
            tokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            wallet: walletSeller,
        })
            .instruction();
    });
}
exports.default = auctionHouseSellIx;
