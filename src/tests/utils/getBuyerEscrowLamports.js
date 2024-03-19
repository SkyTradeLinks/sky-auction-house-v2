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
const Wallets_1 = require("tests/constants/Wallets");
const getBalance_1 = __importDefault(require("tests/utils/getBalance"));
function getBuyerEscrowLamports(connection, sdk, walletBuyer = Wallets_1.WALLET_BUYER, tokenMint) {
    return __awaiter(this, void 0, void 0, function* () {
        const [escrowPaymentAccount] = yield sdk.findBuyerEscrow(walletBuyer.publicKey, tokenMint);
        return (0, getBalance_1.default)(connection, { account: escrowPaymentAccount });
    });
}
exports.default = getBuyerEscrowLamports;
