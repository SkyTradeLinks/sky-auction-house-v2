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
const findAuctionHouseProgramAsSigner_1 = __importDefault(require("solana/pdas/findAuctionHouseProgramAsSigner"));
function auctionHouseThawDelegatedAccountIx({ auctionHouse, auctionHouseProgramId, authority, program, tokenAccount, tokenMint, walletSeller, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [masterEdition] = (0, formfunction_program_shared_1.findEditionPda)(tokenMint);
        const [programAsSigner, programAsSignerBump] = (0, findAuctionHouseProgramAsSigner_1.default)(auctionHouseProgramId);
        return program.methods
            .thawDelegatedAccount(programAsSignerBump)
            .accounts({
            auctionHouse,
            authority,
            masterEdition,
            metaplexTokenMetadataProgram: formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID,
            programAsSigner,
            seller: walletSeller,
            tokenAccount,
            tokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        })
            .instruction();
    });
}
exports.default = auctionHouseThawDelegatedAccountIx;
//# sourceMappingURL=auctionHouseThawDelegatedAccountIx.js.map