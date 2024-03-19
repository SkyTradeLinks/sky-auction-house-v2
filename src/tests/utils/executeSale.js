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
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const getBalance_1 = __importDefault(require("tests/utils/getBalance"));
const getCreatorShareInLamports_1 = __importDefault(require("tests/utils/getCreatorShareInLamports"));
const getSellerShareInLamports_1 = __importDefault(require("tests/utils/getSellerShareInLamports"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
function executeSale(connection, sdk, tokenMint, buyer, sellers, buyPrice, sellPrice, signer = Wallets_1.WALLET_CREATOR) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Don't check balances if one of seller/buyer is signing since it is hard
        // to account for fees
        const checkBalances = !(signer.publicKey.equals(buyer.wallet.publicKey) ||
            sellers.some((seller) => seller.wallet.publicKey.equals(signer.publicKey)));
        const { wallet: buyerWallet, tokenAccount: buyerTokenAccount } = buyer;
        const [escrowPaymentAccount] = yield sdk.findBuyerEscrow(buyerWallet.publicKey, tokenMint);
        const buyerBalanceBefore = yield (0, getBalance_1.default)(connection, {
            account: escrowPaymentAccount,
        });
        let buyerTokenAmountBefore = 0;
        try {
            buyerTokenAmountBefore = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, buyerTokenAccount);
        }
        catch (_b) {
            // Throws if ATA hasn't been created. executeSale will create it if it does not exist.
        }
        (0, formfunction_program_shared_1.logIfDebug)(`buyer before state: balance ${buyerBalanceBefore}, token amount ${buyerTokenAmountBefore}`);
        const sellerBalancesBefore = yield Promise.all(sellers.map(({ wallet }) => (0, getBalance_1.default)(connection, { wallet: wallet.publicKey })));
        const sellerTokenAmountsBefore = yield Promise.all(sellers.map(({ tokenAccount }) => tokenAccount != null ? (0, formfunction_program_shared_1.getTokenAmount)(connection, tokenAccount) : null));
        sellerBalancesBefore.forEach((sellerBalance, i) => (0, formfunction_program_shared_1.logIfDebug)(`seller ${i} before state: balance ${sellerBalance}, token amount ${sellerTokenAmountsBefore[i]}`));
        const sellerIndex = sellers.findIndex((s) => s.isExecutingSale);
        const seller = sellers[sellerIndex];
        const accounts = {
            buyerPriceInLamports: buyPrice * web3_js_1.LAMPORTS_PER_SOL,
            buyerReceiptTokenAccount: buyerTokenAccount,
            sellerPriceInLamports: sellPrice * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount: seller.tokenAccount,
            tokenMint,
            wallet: signer.publicKey,
            walletBuyer: buyerWallet.publicKey,
            // Naming here is a bit confusing... walletCreator refers to creator of NFT
            walletCreator: seller.wallet.publicKey,
            walletSeller: seller.wallet.publicKey,
        };
        const args = {};
        const remainingAccounts = sellers.map((s) => ({
            isSigner: false,
            isWritable: true,
            pubkey: s.wallet.publicKey,
        }));
        const [lastBidPrice] = yield sdk.findLastBidPrice(tokenMint);
        const lastBidPriceAccountInfoBefore = yield sdk.program.account.lastBidPrice.fetch(lastBidPrice);
        const tx = yield sdk.executeSaleV2Tx(accounts, args, remainingAccounts, 500000);
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, signer);
        // This should not fail after we remove the IX from the SDK
        const lastBidPriceAccountInfoAfter = yield sdk.program.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccountInfoAfter.price.toString()).toEqual("0");
        expect((_a = lastBidPriceAccountInfoAfter.bidder) === null || _a === void 0 ? void 0 : _a.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
        const buyerBalanceAfter = yield (0, getBalance_1.default)(connection, {
            account: escrowPaymentAccount,
        });
        const buyerTokenAmountAfter = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, buyerTokenAccount);
        const sellerBalancesAfter = yield Promise.all(sellers.map(({ wallet }) => (0, getBalance_1.default)(connection, { wallet: wallet.publicKey })));
        const sellerTokenAmountsAfter = yield Promise.all(sellers.map(({ tokenAccount }) => tokenAccount != null ? (0, formfunction_program_shared_1.getTokenAmount)(connection, tokenAccount) : null));
        (0, formfunction_program_shared_1.logIfDebug)(`buyer after state: balance ${buyerBalanceAfter}, token amount ${buyerTokenAmountAfter}`);
        sellerBalancesAfter.forEach((sellerBalance, i) => (0, formfunction_program_shared_1.logIfDebug)(`seller ${i} after state: balance ${sellerBalance}, token amount ${sellerTokenAmountsAfter[i]}`));
        // Check that NFT was transferred from seller to buyer
        expect(buyerTokenAmountAfter - buyerTokenAmountBefore).toEqual(1);
        expect(sellerTokenAmountsBefore[sellerIndex] -
            sellerTokenAmountsAfter[sellerIndex]).toEqual(1);
        // Check that all sellers got paid.
        // This assertion relies on the fact that neither seller is the fee payer. If one of them was
        // the fee payer, they would net a bit less.
        if (checkBalances) {
            const isPrimary = lastBidPriceAccountInfoBefore.hasBeenSold === 0;
            for (let i = 0; i < sellers.length; i += 1) {
                const sellerInner = sellers[i];
                const creatorRoyalties = (0, getCreatorShareInLamports_1.default)(buyPrice, sellerInner.share, sellerInner.basisPoints, isPrimary);
                if (isPrimary) {
                    // Creator royalties encompass the full split if primary sale
                    expect(sellerBalancesAfter[i] - sellerBalancesBefore[i]).toEqual(creatorRoyalties);
                }
                else {
                    const sellerIsExecutingSale = sellerInner.wallet.publicKey.equals(seller.wallet.publicKey);
                    const remainingAmount = sellerIsExecutingSale
                        ? (0, getSellerShareInLamports_1.default)(buyPrice, sellerInner.basisPoints)
                        : 0;
                    expect(sellerBalancesAfter[i] - sellerBalancesBefore[i]).toEqual(creatorRoyalties + remainingAmount);
                }
            }
            expect(buyerBalanceBefore - buyerBalanceAfter).toEqual(buyPrice * web3_js_1.LAMPORTS_PER_SOL);
        }
    });
}
exports.default = executeSale;
