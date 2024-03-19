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
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
function auctionHouseSetEditionDistributorLimitPerAddressIx({ auctionHouse, authority, mint, owner, program }, { limitPerAddress }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [editionDistributor] = (0, findEditionDistributor_1.default)(mint, program.programId);
        const ownerAccount = owner !== null && owner !== void 0 ? owner : (yield program.account.editionDistributor.fetch(editionDistributor, "confirmed")).owner;
        return program.methods
            .setEditionDistributorLimitPerAddress(limitPerAddress)
            .accounts({
            auctionHouse,
            authority,
            editionDistributor,
            owner: ownerAccount,
        })
            .instruction();
    });
}
exports.default = auctionHouseSetEditionDistributorLimitPerAddressIx;
