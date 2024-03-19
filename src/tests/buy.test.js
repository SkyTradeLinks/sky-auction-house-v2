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
const dayjs_1 = __importDefault(require("dayjs"));
const auctionHouseSetLastBidPriceIx_1 = __importDefault(require("solana/instructions/auctionHouseSetLastBidPriceIx"));
const findLastBidPrice_1 = __importDefault(require("solana/pdas/findLastBidPrice"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
const buy_1 = __importDefault(require("tests/utils/buy"));
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
const expectTransactionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectTransactionToFailWithErrorCode"));
const executeSale_1 = __importDefault(require("tests/utils/executeSale"));
const getBuyerEscrowLamports_1 = __importDefault(require("tests/utils/getBuyerEscrowLamports"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const sell_1 = __importDefault(require("tests/utils/sell"));
const getNftTxs_1 = __importDefault(require("tests/utils/txs/getNftTxs"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
let tokenMint;
let tokenAccount;
let buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let buyers;
let metadataData;
let buyer;
let buyer2;
let seller;
let seller2;
const connection = (0, getConnectionForTest_1.default)();
// Use lower buy price to avoid running out of SOL
const BUY_PRICE = 1;
// Use different wallet creator to isolate auction house from other tests
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
function cancelBuy(priceInSol, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const cancelTx = yield auctionHouseSdk.withdrawAndCancelTx({
            receiptAccount: wallet,
            tokenAccount,
            tokenMint,
            wallet,
        }, {
            amount: priceInSol * web3_js_1.LAMPORTS_PER_SOL,
        });
        // Cancel as authority
        yield (0, sendTransactionWithWallet_1.default)(connection, cancelTx, Wallets_1.WALLET_CREATOR);
    });
}
describe("buy tests (placing bids/offers)", () => {
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
        buyer = buyers[0];
        buyer2 = buyers[1];
        seller = sellers[0];
        seller2 = sellers[1];
    }));
    // Skip as it takes too long to wait for finalized for each test, re-enable as needed
    xit.each([SaleType_1.default.InstantSale, SaleType_1.default.Offer])(`executing buy with sale type %i should not set last bid price`, (saleType) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, buy_1.default)(connection, auctionHouseSdk, BUY_PRICE / 100, tokenMint, tokenAccount, buyer2, buyer.publicKey, saleType);
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccount = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount.price.toString()).toEqual("0");
        expect(lastBidPriceAccount.bidder).toBe(null);
        yield cancelBuy(BUY_PRICE / 100, buyer2.publicKey);
    }));
    it("buy", () => __awaiter(void 0, void 0, void 0, function* () {
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, BUY_PRICE);
        // First, buy with someone else
        yield (0, buy_1.default)(connection, auctionHouseSdk, BUY_PRICE / 10, tokenMint, tokenAccount, buyer2, buyer.publicKey);
        // Check that escrow account has been transferred enough lamports.
        const escrowPaymentAccountLamportsBefore = yield (0, getBuyerEscrowLamports_1.default)(connection, auctionHouseSdk, buyer2, tokenMint);
        expect(escrowPaymentAccountLamportsBefore).toEqual(Number((BUY_PRICE / 10) * web3_js_1.LAMPORTS_PER_SOL));
        yield (0, buy_1.default)(connection, auctionHouseSdk, BUY_PRICE / 2, tokenMint, tokenAccount, buyer, buyer2.publicKey);
        // After another bid is placed, make sure the first buyer got refunded
        const escrowPaymentAccountLamports = yield (0, getBuyerEscrowLamports_1.default)(connection, auctionHouseSdk, buyer2, tokenMint);
        expect(escrowPaymentAccountLamports).toBe(0);
        yield (0, buy_1.default)(connection, auctionHouseSdk, BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey);
        const nftTxs = yield (0, getNftTxs_1.default)(connection, tokenMint, 1000, "afterBuy.json");
        const buyTx = nftTxs[0];
        expect(buyTx.fromAddress).toEqual(buyer.publicKey.toString());
        expect(buyTx.toAddress).toEqual(buyer.publicKey.toString());
        expect(buyTx.type).toEqual(NftTransactionType_1.default.Bid);
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccount = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount.price.toString()).toEqual((BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL).toString());
    }));
    it("buy too low", () => __awaiter(void 0, void 0, void 0, function* () {
        // Cancel previous bid at this price first, otherwise will encounter
        // different error (trade state already initialized)
        const cancelTx = yield auctionHouseSdk.cancelTx({
            priceInLamports: (BUY_PRICE / 2) * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        // Need to do as separate tx so data gets cleared after taking away rent
        yield (0, sendTransactionWithWallet_1.default)(connection, cancelTx, Wallets_1.WALLET_CREATOR);
        // Lower bid should now fail (see previous test)
        (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "BidTooLow",
            fn: () => (0, buy_1.default)(connection, auctionHouseSdk, BUY_PRICE / 2, tokenMint, tokenAccount, buyer, buyer.publicKey),
        });
        const tx1 = yield auctionHouseSdk.buyV2Tx({
            previousBidderWallet: buyer.publicKey,
            priceInLamports: BUY_PRICE * 2 * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        const tx2 = yield auctionHouseSdk.buyV2Tx({
            previousBidderWallet: buyer.publicKey,
            priceInLamports: BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        // Cancel previous bid at this price first, otherwise will encounter
        // different error (trade state already initialized)
        const cancelTx2 = yield auctionHouseSdk.cancelTx({
            priceInLamports: BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        // Need to do as separate tx so data gets cleared after taking away rent
        yield (0, sendTransactionWithWallet_1.default)(connection, cancelTx2, Wallets_1.WALLET_CREATOR);
        tx1.add(...tx2.instructions);
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "BidTooLow",
            signers: [buyer],
            transaction: tx1,
        });
    }));
    it("buy too late", () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = yield auctionHouseSdk.buyV2Tx({
            previousBidderWallet: buyer.publicKey,
            priceInLamports: BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, { auctionEndTime: (0, dayjs_1.default)().subtract(2, "day") });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "BidTooLate",
            signers: [buyer],
            transaction: tx,
        });
    }));
    it("cannot place offer on in-progress auction", () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = yield auctionHouseSdk.buyV2MakeOfferTx({
            previousBidderWallet: buyer.publicKey,
            priceInLamports: BUY_PRICE * 2 * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "CannotPlaceOfferWhileOnAuction",
            signers: [buyer],
            transaction: tx,
        });
    }));
    it("incorrect previous bidder", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const [lastBidPrice] = yield auctionHouseSdk.findLastBidPrice(tokenMint);
        const lastBidPriceAccount = yield auctionHouseSdk.program.account.lastBidPrice.fetch(lastBidPrice);
        // Previous bidder is buyer
        expect((_a = lastBidPriceAccount.bidder) === null || _a === void 0 ? void 0 : _a.equals(buyer.publicKey)).toEqual(true);
        const tx = yield auctionHouseSdk.buyV2Tx({
            // Previous bidder as buyer2 should fail
            previousBidderWallet: buyer2.publicKey,
            priceInLamports: BUY_PRICE * 2 * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "PreviousBidderIncorrect",
            signers: [buyer],
            transaction: tx,
        });
        const tx2 = yield auctionHouseSdk.buyV2Tx({
            // Previous bidder as buyer should succeed
            previousBidderWallet: buyer.publicKey,
            priceInLamports: BUY_PRICE * 2 * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        yield expect((0, sendTransactionWithWallet_1.default)(connection, tx2, buyer)).resolves.not.toThrow();
    }));
    it("ZERO_PUBKEY is treated as null when checking for incorrect previous bidder", () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        // Execute sale to reset
        yield (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, { tokenAccount: buyerTokenAccount, wallet: buyer }, [
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
        ], BUY_PRICE * 2, BUY_PRICE, undefined);
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
        const [lastBidPrice] = yield auctionHouseSdk.findLastBidPrice(tokenMint);
        const lastBidPriceAccount = yield auctionHouseSdk.program.account.lastBidPrice.fetch(lastBidPrice);
        // Previous bidder is ZERO_PUBKEY, price should be 0 now
        expect(lastBidPriceAccount.price.toNumber()).toEqual(0);
        expect((_b = lastBidPriceAccount.bidder) === null || _b === void 0 ? void 0 : _b.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
        const setLastBidPriceIx = yield (0, auctionHouseSetLastBidPriceIx_1.default)({
            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseProgramId: auctionHouseSdk.program.programId,
            authority: auctionHouseSdk.walletAuthority,
            owner: seller.publicKey,
            program: auctionHouseSdk.program,
            tokenAccount,
            tokenMint,
        }, { price: BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL });
        yield (0, sendTransactionWithWallet_1.default)(connection, (0, formfunction_program_shared_1.ixToTx)(setLastBidPriceIx), Wallets_1.WALLET_CREATOR);
        const lastBidPriceAccountAfter = yield auctionHouseSdk.program.account.lastBidPrice.fetch(lastBidPrice);
        // Price should now be BUY_PRICE
        expect(lastBidPriceAccountAfter.price.toNumber()).toEqual(BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL);
        expect((_c = lastBidPriceAccountAfter.bidder) === null || _c === void 0 ? void 0 : _c.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
        const tx2 = yield auctionHouseSdk.buyV2Tx({
            // Previous bidder as buyer should succeed
            previousBidderWallet: buyer.publicKey,
            priceInLamports: BUY_PRICE * 2 * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        yield expect((0, sendTransactionWithWallet_1.default)(connection, tx2, buyer)).resolves.not.toThrow();
    }));
});
