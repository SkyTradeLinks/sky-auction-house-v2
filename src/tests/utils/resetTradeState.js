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
const web3_js_1 = require("@solana/web3.js");
const Wallets_1 = require("tests/constants/Wallets");
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const verifyTradeState_1 = __importDefault(require("tests/utils/verifyTradeState"));
function resetTradeState(sdk, connection, { priceInSol, tokenAccount, tokenMint, wallet, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const cancelTx = yield sdk.cancelTx({
            priceInLamports: priceInSol * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet,
        }, {});
        // Cancel as authority
        yield (0, sendTransactionWithWallet_1.default)(connection, cancelTx, Wallets_1.WALLET_CREATOR);
        // Verify trade state is null
        yield (0, verifyTradeState_1.default)(sdk, connection, {
            expectNull: true,
            priceInSol,
            tokenAccount,
            tokenMint,
            wallet,
        });
    });
}
exports.default = resetTradeState;
