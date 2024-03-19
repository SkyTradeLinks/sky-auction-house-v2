"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
const getIdl_1 = __importDefault(require("tests/utils/getIdl"));
const getAllInnerIxsWithIndices_1 = __importDefault(require("tests/utils/txs/getAllInnerIxsWithIndices"));
// DO NOT CHANGE -- if you need to change this to fix tests, that means you will break
// parsing logic for existing sell txs. Reorder accounts instead to make sure token mint
// account stays in this position.
const TOKEN_MINT_POSITION = 11;
function isBuyIx(ix) {
    var _a;
    const ixCoder = new anchor_1.BorshInstructionCoder((0, getIdl_1.default)());
    const decoded = ixCoder.decode((_a = ix.data) !== null && _a !== void 0 ? _a : "", "base58");
    return (ix.programId.equals(AuctionHouse_1.AUCTION_HOUSE_PROGRAM_ID) &&
        ((decoded === null || decoded === void 0 ? void 0 : decoded.name) === "buy" || (decoded === null || decoded === void 0 ? void 0 : decoded.name) === "buyV2"));
}
function parseBuyTx(tx, signature, tokenMint) {
    const ixs = tx.transaction.message.instructions;
    const innerIxs = ((0, getAllInnerIxsWithIndices_1.default)(tx) || []).map((val) => val.ix);
    const bidIx = [...ixs, ...innerIxs].find((ix) => isBuyIx(ix));
    if (bidIx == null) {
        return null;
    }
    const ixCoder = new anchor_1.BorshInstructionCoder((0, getIdl_1.default)());
    const decoded = ixCoder.decode(bidIx.data, "base58");
    const tokenMintForIx = bidIx.accounts[TOKEN_MINT_POSITION];
    if (tokenMint != null && !tokenMint.equals(tokenMintForIx)) {
        return null;
    }
    const bidder = bidIx.accounts[0];
    return {
        blockTime: tx.blockTime,
        fromAddress: bidder.toString(),
        mint: tokenMintForIx.toString(),
        // @ts-ignore
        priceInLamports: decoded === null || decoded === void 0 ? void 0 : decoded.data.buyerPrice.toString(),
        toAddress: bidder.toString(),
        txid: signature,
        type: NftTransactionType_1.default.Bid,
    };
}
exports.default = parseBuyTx;
//# sourceMappingURL=parseBuyTx.js.map