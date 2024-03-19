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
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const setup_1 = require("tests/setup");
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
function fundSplTokenAtas(connection, wallets) {
    return __awaiter(this, void 0, void 0, function* () {
        if (setup_1.IS_NATIVE) {
            return;
        }
        const treasuryMint = yield (0, getTreasuryMint_1.default)();
        yield Promise.all(wallets.map((wallet) => __awaiter(this, void 0, void 0, function* () {
            const ata = yield (0, formfunction_program_shared_1.createAtaIfNotExists)(connection, wallet.publicKey, treasuryMint, wallet, "wallet");
            const amount = 50 * Math.pow(10, AuctionHouse_1.SPL_TOKEN_DECIMALS);
            yield (0, formfunction_program_shared_1.mintTo)(connection, treasuryMint, ata, Wallets_1.WALLET_SPL_TOKEN_MINT_AUTHORITY.publicKey, [Wallets_1.WALLET_SPL_TOKEN_MINT_AUTHORITY], amount);
            const tokenAccountBalance = yield connection.getTokenAccountBalance(ata);
            const tokenAmount = tokenAccountBalance.value.amount;
            (0, formfunction_program_shared_1.logIfDebug)(`Funded ${wallet.publicKey.toString()} with ${amount} SPL token(s), current SPL token balance = ${tokenAmount}`);
        })));
    });
}
exports.default = fundSplTokenAtas;
