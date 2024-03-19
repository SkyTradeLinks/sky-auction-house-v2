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
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const convertPriceFunctionTypeToAnchorArg_1 = __importDefault(require("solana/auction-house/convertPriceFunctionTypeToAnchorArg"));
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
function auctionHouseCreateEditionDistributorIx({ mint, owner, program, tokenAccount, treasuryMint }, { allowlistSalePrice, allowlistSaleStartTime, priceFunctionType, priceParams, publicSaleStartTime, saleEndTime, startingPriceLamports, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [editionDistributor] = (0, findEditionDistributor_1.default)(mint, program.programId);
        const [masterEdition, masterEditionBump] = (0, formfunction_program_shared_1.findEditionPda)(mint);
        return program.methods
            .createEditionDistributor(masterEditionBump, new bn_js_1.BN(startingPriceLamports), (0, convertPriceFunctionTypeToAnchorArg_1.default)(priceFunctionType), priceParams, (0, formfunction_program_shared_1.convertNumberForIxArg)(allowlistSaleStartTime), (0, formfunction_program_shared_1.convertNumberForIxArg)(publicSaleStartTime), (0, formfunction_program_shared_1.convertNumberForIxArg)(saleEndTime), (0, formfunction_program_shared_1.convertNumberForIxArg)(allowlistSalePrice))
            .accounts({
            editionDistributor,
            masterEdition,
            mint,
            owner,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenAccount,
            treasuryMint,
        })
            .instruction();
    });
}
exports.default = auctionHouseCreateEditionDistributorIx;
//# sourceMappingURL=auctionHouseCreateEditionDistributorIx.js.map