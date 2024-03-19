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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const getSellerFreeTradeState_1 = __importDefault(require("solana/auction-house/getSellerFreeTradeState"));
const getTradeState_1 = __importDefault(require("solana/auction-house/getTradeState"));
const findAuctionHouseBuyerEscrow_1 = __importDefault(require("solana/pdas/findAuctionHouseBuyerEscrow"));
const findAuctionHouseFeeAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseFeeAccount"));
const findAuctionHouseProgramAsSigner_1 = __importDefault(require("solana/pdas/findAuctionHouseProgramAsSigner"));
const findAuctionHouseTreasuryAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseTreasuryAccount"));
const getWalletIfNativeElseAta_1 = __importDefault(require("solana/utils/getWalletIfNativeElseAta"));
function auctionHouseExecuteSaleIx({ auctionHouse, auctionHouseProgramId, authority, buyerPriceInLamports, buyerReceiptTokenAccount, lastBidPrice, program, sellerPriceInLamports, tokenAccount, tokenMint, treasuryMint, walletBuyer, walletCreator, walletSeller, }, { tokenSize = 1 }, remainingAccounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const [escrowPaymentAccount, escrowBump] = (0, findAuctionHouseBuyerEscrow_1.default)(auctionHouse, walletBuyer, tokenMint, auctionHouseProgramId);
        const [freeTradeState, freeTradeBump] = yield (0, getSellerFreeTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet: walletSeller,
        });
        const [programAsSigner, programAsSignerBump] = (0, findAuctionHouseProgramAsSigner_1.default)(auctionHouseProgramId);
        const [buyerTradeState, _buyerTradeBump, buyPriceAdjusted] = yield (0, getTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            priceInLamports: buyerPriceInLamports,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet: walletBuyer,
        });
        const [sellerTradeState, _sellerTradeBump, sellPriceAdjusted] = yield (0, getTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            priceInLamports: sellerPriceInLamports,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet: walletSeller,
        });
        const [metadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(tokenMint);
        const [feeAccount] = (0, findAuctionHouseFeeAccount_1.default)(auctionHouse, auctionHouseProgramId);
        const [treasuryAccount] = (0, findAuctionHouseTreasuryAccount_1.default)(auctionHouse, auctionHouseProgramId);
        const [buyerReceiptTokenAccountAta] = (0, formfunction_program_shared_1.findAtaPda)(walletBuyer, tokenMint);
        const [masterEdition] = (0, formfunction_program_shared_1.findEditionPda)(tokenMint);
        return program.methods
            .executeSaleV2(escrowBump, freeTradeBump, programAsSignerBump, buyPriceAdjusted, sellPriceAdjusted, new bn_js_1.BN(tokenSize))
            .accounts({
            ataProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            auctionHouseTreasury: treasuryAccount,
            authority,
            buyer: walletBuyer,
            buyerReceiptTokenAccount: buyerReceiptTokenAccount !== null && buyerReceiptTokenAccount !== void 0 ? buyerReceiptTokenAccount : buyerReceiptTokenAccountAta,
            buyerTradeState,
            escrowPaymentAccount,
            freeTradeState,
            lastBidPrice,
            masterEdition,
            metadata,
            metaplexTokenMetadataProgram: formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID,
            programAsSigner,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            seller: walletSeller,
            sellerPaymentReceiptAccount: yield (0, getWalletIfNativeElseAta_1.default)(walletSeller, treasuryMint),
            sellerTradeState,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenAccount,
            tokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            treasuryMint,
        })
            .remainingAccounts(
        // Not documented in the accounts struct... see pay_creator_fees
        remainingAccounts !== null && remainingAccounts !== void 0 ? remainingAccounts : [
            {
                isSigner: false,
                isWritable: true,
                pubkey: walletCreator,
            },
        ])
            .instruction();
    });
}
exports.default = auctionHouseExecuteSaleIx;
//# sourceMappingURL=auctionHouseExecuteSaleV2Ix.js.map