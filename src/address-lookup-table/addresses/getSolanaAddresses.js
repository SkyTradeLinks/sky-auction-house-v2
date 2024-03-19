"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const ADDRESSES = [
    spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
    web3_js_1.SystemProgram.programId,
    web3_js_1.SYSVAR_CLOCK_PUBKEY,
    web3_js_1.SYSVAR_EPOCH_SCHEDULE_PUBKEY,
    web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
    web3_js_1.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
    web3_js_1.SYSVAR_RENT_PUBKEY,
    web3_js_1.SYSVAR_REWARDS_PUBKEY,
    web3_js_1.SYSVAR_SLOT_HASHES_PUBKEY,
    web3_js_1.SYSVAR_SLOT_HISTORY_PUBKEY,
    web3_js_1.SYSVAR_STAKE_HISTORY_PUBKEY,
    spl_token_1.TOKEN_PROGRAM_ID,
    formfunction_program_shared_1.WRAPPED_SOL_MINT,
];
function getSolanaAddresses() {
    return ADDRESSES;
}
exports.default = getSolanaAddresses;
