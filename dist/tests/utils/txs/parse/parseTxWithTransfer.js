"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spl_token_1 = require("@solana/spl-token");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
function isTransferIx(ix) {
    return (ix.programId.equals(spl_token_1.TOKEN_PROGRAM_ID) &&
        ["transfer", "transferChecked"].includes(ix.parsed.type));
}
function parseTxWithTransfer(tx, signature, tokenMint) {
    var _a, _b;
    const ixs = tx.transaction.message.instructions;
    const transferIx = ixs.find((ix) => isTransferIx(ix));
    const allInnerTxs = (_b = (_a = tx.meta) === null || _a === void 0 ? void 0 : _a.innerInstructions) === null || _b === void 0 ? void 0 : _b.reduce((acc, currVal) => [
        ...acc,
        ...currVal.instructions,
    ], []);
    const innerTransferIx = allInnerTxs === null || allInnerTxs === void 0 ? void 0 : allInnerTxs.find((ix) => isTransferIx(ix));
    if (transferIx == null && innerTransferIx == null) {
        return null;
    }
    const postTokenBalances = tx.meta.postTokenBalances;
    const preTokenBalances = tx.meta.preTokenBalances;
    const fromAddress = preTokenBalances.find((balance) => balance.uiTokenAmount.uiAmount != null &&
        balance.uiTokenAmount.uiAmount > 0 &&
        balance.mint === tokenMint.toString()).owner;
    const toAddress = postTokenBalances.find((balance) => balance.uiTokenAmount.uiAmount != null &&
        balance.uiTokenAmount.uiAmount > 0 &&
        balance.mint === tokenMint.toString()).owner;
    return {
        blockTime: tx.blockTime,
        fromAddress: fromAddress.toString(),
        mint: tokenMint.toString(),
        toAddress: toAddress.toString(),
        txid: signature,
        type: NftTransactionType_1.default.Transferred,
    };
}
exports.default = parseTxWithTransfer;
//# sourceMappingURL=parseTxWithTransfer.js.map