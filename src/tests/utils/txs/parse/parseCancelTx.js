"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
const getIdl_1 = __importDefault(require("tests/utils/getIdl"));
const TOKEN_MINT_POSITION = 2;
function isCancelIx(ix) {
    var _a;
    const ixCoder = new anchor_1.BorshInstructionCoder((0, getIdl_1.default)());
    const decoded = ixCoder.decode((_a = ix.data) !== null && _a !== void 0 ? _a : "", "base58");
    return (ix.programId.equals(AuctionHouse_1.AUCTION_HOUSE_PROGRAM_ID) &&
        ((decoded === null || decoded === void 0 ? void 0 : decoded.name) === "cancel" || (decoded === null || decoded === void 0 ? void 0 : decoded.name) === "cancelV2"));
}
function parseCancelTx(tx, signature, tokenMint) {
    const ixs = tx.transaction.message.instructions;
    const cancelIx = ixs.find((ix) => isCancelIx(ix));
    if (cancelIx == null) {
        return null;
    }
    const tokenMintForIx = cancelIx.accounts[TOKEN_MINT_POSITION];
    if (tokenMint != null && !tokenMint.equals(tokenMintForIx)) {
        return null;
    }
    const lister = cancelIx.accounts[0];
    return {
        blockTime: tx.blockTime,
        fromAddress: lister.toString(),
        mint: tokenMintForIx.toString(),
        toAddress: lister.toString(),
        txid: signature,
        type: NftTransactionType_1.default.ListingCancelled,
    };
}
exports.default = parseCancelTx;
