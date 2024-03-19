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
const setup_1 = require("tests/setup");
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
// Used to get either SOL balance or SPL token balance
// depending on which treasury mint is used.
//
// NOTE: DO NOT use for querying NFT token balance
function getBalance(connection, query, isNativeOverride) {
    return __awaiter(this, void 0, void 0, function* () {
        const { account, wallet } = query;
        (0, tiny_invariant_1.default)((account != null && wallet == null) || (wallet != null && account == null), "Only one of account or wallet must be non-null");
        if (setup_1.IS_NATIVE || isNativeOverride === true) {
            return connection.getBalance((account !== null && account !== void 0 ? account : wallet));
        }
        const tokenAccount = account !== null && account !== void 0 ? account : (0, formfunction_program_shared_1.findAtaPda)(wallet, yield (0, getTreasuryMint_1.default)())[0];
        let tokenAccountBalance;
        try {
            tokenAccountBalance = yield connection.getTokenAccountBalance(tokenAccount);
        }
        catch (_a) {
            // In cases where the account is not initialized yet, return 0
            return 0;
        }
        return Number(tokenAccountBalance.value.amount);
    });
}
exports.default = getBalance;
