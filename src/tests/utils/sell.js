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
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const verifyDelegateAndFrozen_1 = __importDefault(require("tests/utils/verifyDelegateAndFrozen"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
function sell(connection, sdk, tokenMint, tokenAccount, seller, priceInSol, saleType = SaleType_1.default.Auction) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, formfunction_program_shared_1.logIfDebug)("calling sell");
        const accounts = {
            priceInLamports: priceInSol * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        };
        const args = {};
        const tx = yield (saleType === SaleType_1.default.Auction
            ? sdk.sellTx(accounts, args)
            : sdk.sellInstantSaleTx(accounts, args));
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, seller);
        (0, formfunction_program_shared_1.logIfDebug)("finished calling sell");
        // Check that token account delegate is program as signer
        const [programAsSigner] = yield sdk.findProgramAsSigner();
        yield (0, verifyDelegateAndFrozen_1.default)(connection, tokenMint, tokenAccount, seller, sdk.program.programId, true, programAsSigner);
        // Check that seller trade state has been created, and that it contains the right bump
        const [tradeState, tradeBump] = yield sdk.findTradeState(seller.publicKey, tokenAccount, tokenMint, priceInSol * web3_js_1.LAMPORTS_PER_SOL);
        const sellerTradeState = yield connection.getAccountInfo(tradeState);
        expect(sellerTradeState).toBeDefined();
        expect(Number(sellerTradeState.data[0])).toEqual(tradeBump);
    });
}
exports.default = sell;
