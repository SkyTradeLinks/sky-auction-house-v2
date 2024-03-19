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
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
function getRemainingAccounts(remainingAccounts, treasuryMint) {
    return __awaiter(this, void 0, void 0, function* () {
        if (remainingAccounts == null || (0, formfunction_program_shared_1.isMintNative)(treasuryMint)) {
            return remainingAccounts;
        }
        const remainingAccountsWithTokenAccounts = yield Promise.all(remainingAccounts.map((accountMeta) => __awaiter(this, void 0, void 0, function* () {
            return [
                accountMeta,
                Object.assign(Object.assign({}, accountMeta), { 
                    // Token accounts should not be required as signers
                    isSigner: false, pubkey: (0, formfunction_program_shared_1.findAtaPda)(accountMeta.pubkey, treasuryMint)[0] }),
            ];
        })));
        return (0, formfunction_program_shared_1.flat)(remainingAccountsWithTokenAccounts);
    });
}
exports.default = getRemainingAccounts;
