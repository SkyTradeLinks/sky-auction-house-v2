"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spl_token_1 = require("@solana/spl-token");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
function isCreateMintIx(ix) {
    return (ix.programId.equals(spl_token_1.TOKEN_PROGRAM_ID) &&
        ix.parsed.type === "initializeMint");
}
function parseCreateMintTx(tx, signature) {
    const ixs = tx.transaction.message.instructions;
    const createMintIx = ixs.find((ix) => isCreateMintIx(ix));
    if (createMintIx == null) {
        return null;
    }
    const mintAuthority = createMintIx.parsed.info
        .mintAuthority;
    const mint = createMintIx.parsed.info.mint;
    return {
        blockTime: tx.blockTime,
        fromAddress: mintAuthority,
        mint,
        toAddress: mintAuthority,
        txid: signature,
        type: NftTransactionType_1.default.Minted,
    };
}
exports.default = parseCreateMintTx;
