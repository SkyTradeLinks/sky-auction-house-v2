"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
const getIdl_1 = __importDefault(require("tests/utils/getIdl"));
const TOKEN_MINT_POSITION = 3;
function isExecuteSaleIx(ix) {
    var _a;
    const ixCoder = new anchor_1.BorshInstructionCoder((0, getIdl_1.default)());
    const decoded = ixCoder.decode((_a = ix.data) !== null && _a !== void 0 ? _a : "", "base58");
    return (ix.programId.equals(AuctionHouse_1.AUCTION_HOUSE_PROGRAM_ID) &&
        (decoded === null || decoded === void 0 ? void 0 : decoded.name) === "executeSale");
}
function parseExecuteSaleTx(tx, signature, tokenMint) {
    const ixs = tx.transaction.message.instructions;
    const executeSaleIx = ixs.find((ix) => isExecuteSaleIx(ix));
    if (executeSaleIx == null) {
        return null;
    }
    const ixCoder = new anchor_1.BorshInstructionCoder((0, getIdl_1.default)());
    const decoded = ixCoder.decode(executeSaleIx.data, "base58");
    const tokenMintForIx = executeSaleIx
        .accounts[TOKEN_MINT_POSITION];
    if (tokenMint != null && !tokenMint.equals(tokenMintForIx)) {
        return null;
    }
    const buyer = executeSaleIx.accounts[0];
    const seller = executeSaleIx.accounts[1];
    return {
        blockTime: tx.blockTime,
        fromAddress: seller.toString(),
        mint: tokenMintForIx.toString(),
        // @ts-ignore
        priceInLamports: decoded === null || decoded === void 0 ? void 0 : decoded.data.buyerPrice.toString(),
        toAddress: buyer.toString(),
        txid: signature,
        type: NftTransactionType_1.default.Sold,
    };
}
exports.default = parseExecuteSaleTx;
//# sourceMappingURL=parseExecuteSale.js.map