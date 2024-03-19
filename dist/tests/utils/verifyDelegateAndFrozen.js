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
const findAuctionHouseProgramAsSigner_1 = __importDefault(require("solana/pdas/findAuctionHouseProgramAsSigner"));
const expectEqPubkeys_1 = __importDefault(require("tests/utils/expectEqPubkeys"));
const expectNeqPubkeys_1 = __importDefault(require("tests/utils/expectNeqPubkeys"));
function verifyDelegateAndFrozen(connection, tokenMint, tokenAccount, wallet, auctionHouseProgramId, expectedIsFrozen, expectedDelegate) {
    return __awaiter(this, void 0, void 0, function* () {
        const [programAsSigner, _programAsSignerBump] = (0, findAuctionHouseProgramAsSigner_1.default)(auctionHouseProgramId);
        // Check that token account delegate is no longer program as signer
        const tokenAccountInfoAfter = yield (0, formfunction_program_shared_1.getTokenAccountInfo)(connection, tokenAccount);
        expectedDelegate
            ? (0, expectEqPubkeys_1.default)(tokenAccountInfoAfter.delegate, expectedDelegate)
            : (0, expectNeqPubkeys_1.default)(tokenAccountInfoAfter.delegate, programAsSigner);
        expect(tokenAccountInfoAfter.isFrozen).toEqual(expectedIsFrozen);
    });
}
exports.default = verifyDelegateAndFrozen;
//# sourceMappingURL=verifyDelegateAndFrozen.js.map