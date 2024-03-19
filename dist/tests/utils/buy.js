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
const Wallets_1 = require("tests/constants/Wallets");
const getBuyerEscrowLamports_1 = __importDefault(require("tests/utils/getBuyerEscrowLamports"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
function getBuyTx(sdk, accounts, args, saleType) {
    switch (saleType) {
        case SaleType_1.default.InstantSale:
            return sdk.buyV2InstantSaleTx(accounts, args);
        case SaleType_1.default.Offer:
            return sdk.buyV2MakeOfferTx(accounts, args);
        case SaleType_1.default.Auction:
        default:
            return sdk.buyV2Tx(accounts, args);
    }
}
function buy(connection, sdk, priceInSol, tokenMint, tokenAccount, walletBuyer, previousBidderWallet, saleType = SaleType_1.default.Auction, checkEscrow = true) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, formfunction_program_shared_1.logIfDebug)("calling buy");
        const [lastBidPrice] = yield sdk.findLastBidPrice(tokenMint);
        if ((yield connection.getAccountInfo(lastBidPrice)) == null) {
            (0, formfunction_program_shared_1.logIfDebug)(`lastBidPrice at ${lastBidPrice.toString()} not created, creating...`);
            const createLastBidPriceTx = yield sdk.createLastBidPriceTx({
                tokenMint,
                wallet: Wallets_1.WALLET_CREATOR.publicKey,
            });
            yield (0, sendTransactionWithWallet_1.default)(connection, createLastBidPriceTx, Wallets_1.WALLET_CREATOR);
        }
        const accounts = {
            previousBidderWallet: previousBidderWallet,
            priceInLamports: priceInSol * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: walletBuyer.publicKey,
        };
        const args = {};
        const tx = yield getBuyTx(sdk, accounts, args, saleType);
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, walletBuyer);
        (0, formfunction_program_shared_1.logIfDebug)("finished calling buy");
        // Check that escrow account has been transferred enough lamports.
        if (checkEscrow) {
            const escrowPaymentAccountLamportsAfter = yield (0, getBuyerEscrowLamports_1.default)(connection, sdk, walletBuyer, tokenMint);
            expect(escrowPaymentAccountLamportsAfter).toBeDefined();
            expect(escrowPaymentAccountLamportsAfter).toEqual(Number(priceInSol * web3_js_1.LAMPORTS_PER_SOL));
        }
        // Check that buyer trade state has been created, and it contains the right bump
        const [tradeState, tradeBump] = yield sdk.findTradeState(walletBuyer.publicKey, tokenAccount, tokenMint, priceInSol * web3_js_1.LAMPORTS_PER_SOL);
        const buyerTradeState = yield connection.getAccountInfo(tradeState);
        expect(buyerTradeState).toBeDefined();
        expect(Number(buyerTradeState.data[0])).toEqual(tradeBump);
    });
}
exports.default = buy;
//# sourceMappingURL=buy.js.map