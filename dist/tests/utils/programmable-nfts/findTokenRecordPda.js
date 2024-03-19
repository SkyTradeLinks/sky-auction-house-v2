"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
function findTokenRecordPda(mint, token) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("token_record"),
        token.toBuffer(),
    ], formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID);
}
exports.default = findTokenRecordPda;
//# sourceMappingURL=findTokenRecordPda.js.map