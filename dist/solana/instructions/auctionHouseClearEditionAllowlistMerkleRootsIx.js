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
const findEditionAllowlistSettingsAccount_1 = __importDefault(require("solana/pdas/findEditionAllowlistSettingsAccount"));
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
function auctionHouseClearEditionAllowlistMerkleRootsIx({ auctionHouse, authority, mint, program, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [editionDistributor] = (0, findEditionDistributor_1.default)(mint, program.programId);
        const [editionAllowlistSettings] = (0, findEditionAllowlistSettingsAccount_1.default)(editionDistributor, program.programId);
        return program.methods
            .clearEditionAllowlistMerkleRoots()
            .accounts({
            auctionHouse,
            authority,
            editionAllowlistSettings,
            editionDistributor,
        })
            .instruction();
    });
}
exports.default = auctionHouseClearEditionAllowlistMerkleRootsIx;
//# sourceMappingURL=auctionHouseClearEditionAllowlistMerkleRootsIx.js.map