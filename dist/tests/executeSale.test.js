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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const auctionHouseThawDelegatedAccountIx_1 = __importDefault(require("solana/instructions/auctionHouseThawDelegatedAccountIx"));
const findLastBidPrice_1 = __importDefault(require("solana/pdas/findLastBidPrice"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const setup_1 = require("tests/setup");
const buy_1 = __importDefault(require("tests/utils/buy"));
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
const executeSale_1 = __importDefault(require("tests/utils/executeSale"));
const fundSplTokenAccount_1 = __importDefault(require("tests/utils/fundSplTokenAccount"));
const getBalance_1 = __importDefault(require("tests/utils/getBalance"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const getTreasuryWithdrawalDestination_1 = __importDefault(require("tests/utils/getTreasuryWithdrawalDestination"));
const resetTradeState_1 = __importDefault(require("tests/utils/resetTradeState"));
const sell_1 = __importDefault(require("tests/utils/sell"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const verifyDelegateAndFrozen_1 = __importDefault(require("tests/utils/verifyDelegateAndFrozen"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
// NOTE: use existing tokenMint to make test faster.
// Use new tokenMint to test everything from scratch.
// let tokenMint: PublicKey = new PublicKey(
//   "2VkhToHLLb3jwZRwmsbx74wVf3i5UHziSU7Fjyp19V9W"
// );
let tokenMint;
let tokenAccount;
let buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let buyers;
let metadataData;
let buyer;
let seller;
let seller2;
let sellersForExecuteSale;
const connection = (0, getConnectionForTest_1.default)();
// Use different wallet creator to isolate auction house from other tests
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
function checkSellerTokenAmount(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const sellerTokenAmountBefore = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, tokenAccount);
        expect(sellerTokenAmountBefore).toEqual(amount);
    });
}
function acceptOfferAsSeller(buyPrice) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = yield auctionHouseSdk.sellAcceptOfferTx({
            buyerReceiptTokenAccount: buyerTokenAccount,
            priceInLamports: buyPrice * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
            walletBuyer: buyer.publicKey,
            walletCreator: seller.publicKey,
            walletSeller: seller.publicKey,
        }, {}, [
            {
                isSigner: true,
                isWritable: true,
                pubkey: seller.publicKey,
            },
            {
                isSigner: false,
                isWritable: true,
                pubkey: seller2.publicKey,
            },
        ]);
        yield checkSellerTokenAmount(1);
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, seller);
        yield checkSellerTokenAmount(0);
    });
}
describe("execute sale tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        [
            auctionHouseSdk,
            buyerTokenAccount,
            tokenAccount,
            tokenMint,
            sellers,
            buyers,
            metadataData,
        ] = yield (0, getTestSetup_1.default)(connection, {
            basisPoints: AuctionHouse_1.BASIS_POINTS,
            basisPointsSecondary: AuctionHouse_1.BASIS_POINTS_SECONDARY,
            creator: programCreator,
            treasuryMint: yield (0, getTreasuryMint_1.default)(),
        }, Wallets_1.WALLET_CREATOR);
        seller = sellers[0];
        seller2 = sellers[1];
        buyer = buyers[0];
        sellersForExecuteSale = [
            {
                basisPoints: AuctionHouse_1.BASIS_POINTS,
                isExecutingSale: true,
                share: metadataData.creators[0].share,
                tokenAccount,
                wallet: seller,
            },
            {
                basisPoints: AuctionHouse_1.BASIS_POINTS,
                isExecutingSale: false,
                share: metadataData.creators[1].share,
                wallet: seller2,
            },
        ];
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({ connection, wallets: [...buyers, ...sellers] });
        yield (0, fundSplTokenAccount_1.default)(connection, [...buyers, ...sellers]);
    }));
    it("execute sale—same price (and check that hasBeenSold gets set to true)", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE);
        // Bidder places bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey);
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccountBefore = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccountBefore.hasBeenSold).toEqual(0);
        yield (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, { tokenAccount: buyerTokenAccount, wallet: buyer }, sellersForExecuteSale, AuctionHouse_1.BUY_PRICE, AuctionHouse_1.BUY_PRICE);
        const lastBidPriceAccountAfter = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccountAfter.price.toString()).toEqual("0");
        expect((_a = lastBidPriceAccountAfter.bidder) === null || _a === void 0 ? void 0 : _a.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
        expect(lastBidPriceAccountAfter.hasBeenSold).toEqual(1);
        yield (0, verifyDelegateAndFrozen_1.default)(connection, tokenMint, tokenAccount, seller, programCreator.programId, false);
    }));
    it("execute sale—different price", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyPrice = 11;
        const sellPrice = 10;
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, sellPrice);
        yield (0, buy_1.default)(connection, auctionHouseSdk, buyPrice, tokenMint, tokenAccount, buyer, buyer.publicKey);
        yield (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, { tokenAccount: buyerTokenAccount, wallet: buyer }, sellersForExecuteSale, buyPrice, sellPrice);
        yield (0, verifyDelegateAndFrozen_1.default)(connection, tokenMint, tokenAccount, seller, programCreator.programId, false);
    }));
    it("execute sale does not work with invalid buyer receipt token account", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyPrice = 11;
        const sellPrice = 10;
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, sellPrice);
        yield (0, buy_1.default)(connection, auctionHouseSdk, buyPrice, tokenMint, tokenAccount, buyer, buyer.publicKey);
        const executeSaleHelper = (buyerTokenAccountInner) => (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, { tokenAccount: buyerTokenAccountInner, wallet: buyer }, sellersForExecuteSale, buyPrice, sellPrice);
        // Try with random keypair as token account
        const randomKeypair = web3_js_1.Keypair.generate();
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "MissingAccount",
            fn: () => executeSaleHelper(randomKeypair.publicKey),
        });
        // Incorrect owner (tokenAccount is not owned by buyer)
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "IncorrectOwner",
            fn: () => executeSaleHelper(tokenAccount),
        });
        // Actually execute the sale so subsequent tests can run
        // TODO: should decouple all the test in this module from each other
        yield expect(executeSaleHelper(buyerTokenAccount)).resolves.not.toThrow();
    }));
    it("execute sale—after revoking", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyPrice = 10;
        const sellPrice = 10;
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, sellPrice);
        // Thaw first as revoke cannot happen when frozen
        const thawTx = (0, formfunction_program_shared_1.ixToTx)(yield (0, auctionHouseThawDelegatedAccountIx_1.default)({
            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseProgramId: AuctionHouse_1.AUCTION_HOUSE_PROGRAM_ID,
            authority: auctionHouseSdk.walletAuthority,
            program: auctionHouseSdk.program,
            tokenAccount,
            tokenMint,
            walletSeller: seller.publicKey,
        }));
        thawTx.add((0, spl_token_1.createRevokeInstruction)(tokenAccount, seller.publicKey, []));
        yield (0, sendTransactionWithWallet_1.default)(connection, thawTx, seller);
        yield (0, buy_1.default)(connection, auctionHouseSdk, buyPrice, tokenMint, tokenAccount, buyer, buyer.publicKey);
        const tx = yield auctionHouseSdk.executeSaleV2Tx({
            buyerPriceInLamports: buyPrice * web3_js_1.LAMPORTS_PER_SOL,
            buyerReceiptTokenAccount: buyerTokenAccount,
            sellerPriceInLamports: sellPrice * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: Wallets_1.WALLET_CREATOR.publicKey,
            walletBuyer: buyer.publicKey,
            // Naming here is a bit confusing... walletCreator refers to creator of NFT
            walletCreator: seller.publicKey,
            walletSeller: seller.publicKey,
        }, {}, [
            {
                isSigner: false,
                isWritable: true,
                pubkey: seller.publicKey,
            },
            {
                isSigner: false,
                isWritable: true,
                pubkey: seller2.publicKey,
            },
        ]);
        // Do this instead of calling executeSale, because executeSale signs with WALLET_CREATOR
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, seller);
        yield (0, verifyDelegateAndFrozen_1.default)(connection, tokenMint, tokenAccount, seller, programCreator.programId, false);
    }));
    it("execute sale v2 as seller revokes program as signer as delegate", () => __awaiter(void 0, void 0, void 0, function* () {
        // Transfer it back to seller
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        // Seller lists, program as signer should be a delegate
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE);
        // Bidder places bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey);
        yield (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, { tokenAccount: buyerTokenAccount, wallet: buyer }, sellersForExecuteSale, AuctionHouse_1.BUY_PRICE, AuctionHouse_1.BUY_PRICE, seller);
        const tokenAccountInfoAfter = yield (0, formfunction_program_shared_1.getTokenAccountInfo)(connection, tokenAccount);
        expect(tokenAccountInfoAfter.delegate).toBe(null);
    }));
    it("execute sale for offer as seller works as expected", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyPrice = 5;
        // Transfer it back to seller
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        // Buyer makes an offer
        yield (0, buy_1.default)(connection, auctionHouseSdk, buyPrice, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Offer);
        // Check that this works
        yield expect(acceptOfferAsSeller(buyPrice)).resolves.not.toThrow();
    }));
    it.each([
        [5, 5, SaleType_1.default.Auction],
        [5, 10, SaleType_1.default.Auction],
        [5, 5, SaleType_1.default.InstantSale],
        [5, 10, SaleType_1.default.InstantSale],
    ])("execute sale for offer as seller works as expected when piece is listed for %i SOL and offer is for %i SOL with sale type %i", (buyPriceInSol, listingPriceInSol, saleType) => __awaiter(void 0, void 0, void 0, function* () {
        // Transfer it back to seller
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, listingPriceInSol, saleType);
        // Buyer makes an offer
        yield (0, buy_1.default)(connection, auctionHouseSdk, buyPriceInSol, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Offer);
        const [tradeStateAddress] = yield auctionHouseSdk.findTradeState(seller.publicKey, tokenAccount, tokenMint, buyPriceInSol * web3_js_1.LAMPORTS_PER_SOL);
        const tradeStateAccount = yield connection.getAccountInfo(tradeStateAddress);
        if (buyPriceInSol === listingPriceInSol) {
            expect(tradeStateAccount).not.toBe(null);
            expect(tradeStateAccount.data[1]).toEqual(saleType);
        }
        else {
            expect(tradeStateAccount).toBe(null);
        }
        yield expect(acceptOfferAsSeller(buyPriceInSol)).resolves.not.toThrow();
        if (buyPriceInSol !== listingPriceInSol) {
            // Cancel the listing trade state to not mess up future listings
            yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
                priceInSol: listingPriceInSol,
                tokenAccount,
                tokenMint,
                wallet: seller.publicKey,
            });
        }
    }));
    it("execute sale must use highest bid price", () => __awaiter(void 0, void 0, void 0, function* () {
        const listingPrice = 1;
        const bidPrice1 = 1.5;
        const bidPrice2 = 2.5;
        // Transfer it back to seller
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, listingPrice);
        // Buyer 1 places a bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, bidPrice1, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Auction, false);
        // Buyer 1 places another bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, bidPrice2, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Auction, false);
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "MismatchedPrices",
            fn: () => (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, {
                tokenAccount: buyerTokenAccount,
                wallet: buyer,
            }, sellersForExecuteSale, 
            // This should fail, because we didn't use the highest bid price
            bidPrice1, listingPrice),
        });
        // Actually execute the sale so subsequent tests can run
        // TODO: should decouple all the test in this module from each other
        yield (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, {
            tokenAccount: buyerTokenAccount,
            wallet: buyer,
        }, sellersForExecuteSale, bidPrice2, listingPrice);
    }));
    it("execute sale for offer as seller does not work if auction has started (i.e., bid already placed)", () => __awaiter(void 0, void 0, void 0, function* () {
        const buyPrice = 0.5;
        const listingPrice = 1;
        // Transfer it back to seller
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, listingPrice);
        // Buyer 1 makes an offer
        yield (0, buy_1.default)(connection, auctionHouseSdk, buyPrice, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Offer);
        // Buyer 1 places a bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, listingPrice, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Auction, false);
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "CannotAcceptOfferWhileOnAuction",
            fn: () => acceptOfferAsSeller(buyPrice),
        });
    }));
    // Put this here to test that executing sale correctly deposits fees to treasury
    // NOTE: placed at the end as it is least likely to conflict with other tests
    // that execute concurrently and use the same auction house
    it("withdraw from treasury", () => __awaiter(void 0, void 0, void 0, function* () {
        const balanceBefore = yield (0, getBalance_1.default)(connection, {
            wallet: Wallets_1.WALLET_CREATOR.publicKey,
        });
        const { treasuryWithdrawalDestination } = yield (0, getTreasuryWithdrawalDestination_1.default)(Wallets_1.WALLET_CREATOR.publicKey);
        const tx = yield auctionHouseSdk.withdrawFromTreasuryTx({
            treasuryWithdrawalDestination,
        }, { amount: web3_js_1.LAMPORTS_PER_SOL });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, Wallets_1.WALLET_CREATOR);
        const balanceAfter = yield (0, getBalance_1.default)(connection, {
            wallet: Wallets_1.WALLET_CREATOR.publicKey,
        });
        expect(balanceAfter - balanceBefore).toEqual(setup_1.IS_NATIVE ? web3_js_1.LAMPORTS_PER_SOL - 5000 : web3_js_1.LAMPORTS_PER_SOL);
    }));
});
//# sourceMappingURL=executeSale.test.js.map