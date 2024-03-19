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
const auctionHouseBuyV2Ix_1 = __importDefault(require("solana/instructions/auctionHouseBuyV2Ix"));
const auctionHouseSellIx_1 = __importDefault(require("solana/instructions/auctionHouseSellIx"));
const auctionHouseSetLastBidPriceIx_1 = __importDefault(require("solana/instructions/auctionHouseSetLastBidPriceIx"));
const getWalletIfNativeElseAta_1 = __importDefault(require("solana/utils/getWalletIfNativeElseAta"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const buy_1 = __importDefault(require("tests/utils/buy"));
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
const expectTransactionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectTransactionToFailWithErrorCode"));
const executeSale_1 = __importDefault(require("tests/utils/executeSale"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const resetTradeState_1 = __importDefault(require("tests/utils/resetTradeState"));
const sell_1 = __importDefault(require("tests/utils/sell"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const verifyTradeState_1 = __importDefault(require("tests/utils/verifyTradeState"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
let tokenMint;
let tokenAccount;
let buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let buyers;
let metadataData;
let seller;
let seller2;
let buyer;
const connection = (0, getConnectionForTest_1.default)();
// Use different wallet creator to isolate auction house from other tests
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
function createTradeState(priceInSol, saleType, wallet, allocationSize, tokenAccountOverride) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = yield auctionHouseSdk.createTradeStateTx({
            allocationSize,
            priceInLamports: priceInSol * web3_js_1.LAMPORTS_PER_SOL,
            saleType,
            tokenAccount: tokenAccountOverride !== null && tokenAccountOverride !== void 0 ? tokenAccountOverride : tokenAccount,
            tokenMint,
            wallet,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, Wallets_1.WALLET_CREATOR);
        yield (0, verifyTradeState_1.default)(auctionHouseSdk, connection, {
            expectNull: false,
            priceInSol,
            saleType: allocationSize === 1 ? undefined : saleType,
            size: allocationSize,
            tokenAccount,
            tokenMint,
            wallet,
        });
    });
}
function resetLastBidPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        const ix = yield (0, auctionHouseSetLastBidPriceIx_1.default)({
            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseProgramId: auctionHouseSdk.program.programId,
            authority: auctionHouseSdk.walletAuthority,
            owner: seller.publicKey,
            program: auctionHouseSdk.program,
            tokenAccount,
            tokenMint,
        }, { price: 0 });
        yield (0, sendTransactionWithWallet_1.default)(connection, (0, formfunction_program_shared_1.ixToTx)(ix), Wallets_1.WALLET_CREATOR);
    });
}
function executeSaleHelper(priceInSol, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, executeSale_1.default)(connection, auctionHouseSdk, tokenMint, { tokenAccount: buyerTokenAccount, wallet: buyer }, [
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
        ], priceInSol, priceInSol, signer);
    });
}
describe("trade state tests", () => {
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
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({ connection, wallets: [buyer, seller, seller2] });
    }));
    it("verify creating trade state with no allocation size creates it with 130 bytes", () => __awaiter(void 0, void 0, void 0, function* () {
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, seller.publicKey);
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
    }));
    it("verify that trade state cannot be created for token account with amount < 1", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "InvalidTokenAccountAmount",
            fn: () => createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, seller.publicKey, undefined, buyerTokenAccount),
        });
    }));
    it("verify creating trade state with allocation size creates it with specified size", () => __awaiter(void 0, void 0, void 0, function* () {
        // Allocate with 1 byte
        const allocationSize = 1;
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, seller.publicKey, allocationSize);
        // Check that re-calling `createTradeState` without cancelling does nothing
        // by ensuring allocation size is the same as before
        const tx = yield auctionHouseSdk.createTradeStateTx({
            allocationSize: allocationSize + 1,
            priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            saleType: SaleType_1.default.InstantSale,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "TradeStateAlreadyInitialized",
            signers: [Wallets_1.WALLET_CREATOR],
            transaction: tx,
        });
        // Check that re-calling `createTradeState` without cancelling does nothing
        // by ensuring allocation size is the same as before
        yield (0, verifyTradeState_1.default)(auctionHouseSdk, connection, {
            expectNull: false,
            priceInSol: AuctionHouse_1.BUY_PRICE,
            size: allocationSize,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        // Reset
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        const allocationSize2 = 512;
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, seller.publicKey, allocationSize2);
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
    }));
    it("creating trade state prior to calling sell causes error", () => __awaiter(void 0, void 0, void 0, function* () {
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, seller.publicKey);
        // Seller lists
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "TradeStateAlreadyInitialized",
            fn: () => (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE),
        });
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
    }));
    it("creating trade state prior to calling buy causes error", () => __awaiter(void 0, void 0, void 0, function* () {
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, buyer.publicKey);
        // Buyer places bid
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "TradeStateAlreadyInitialized",
            fn: () => (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey),
        });
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        });
    }));
    it("mismatched sale types should throw an error when attempting to execute sale", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = AuctionHouse_1.BUY_PRICE / 2;
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, price, SaleType_1.default.InstantSale);
        // Buyer places bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, price, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Auction);
        // Execute sale should throw
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "SellerBuyerSaleTypeMustMatch",
            fn: () => executeSaleHelper(price, undefined),
        });
        // Reset before next test
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: price,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: price,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        });
        yield resetLastBidPrice();
    }));
    it("can cancel and re-create trade state on existing listings with trade states", () => __awaiter(void 0, void 0, void 0, function* () {
        // Manually create trade state with size 1 byte and have seller list
        // without calling create trade state (call sell Ix directly to simulate old listings)
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.Auction, seller.publicKey, 1);
        const sellIx = yield (0, auctionHouseSellIx_1.default)({
            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseProgramId: auctionHouseSdk.program.programId,
            authority: auctionHouseSdk.walletAuthority,
            feeAccount: auctionHouseSdk.feeAccount,
            priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            program: auctionHouseSdk.program,
            tokenAccount,
            tokenMint,
            treasuryMint: auctionHouseSdk.treasuryMint,
            walletSeller: seller.publicKey,
        }, {});
        yield (0, sendTransactionWithWallet_1.default)(connection, (0, formfunction_program_shared_1.ixToTx)(sellIx), seller);
        // Trade state should exist but sale type will not be set
        yield (0, verifyTradeState_1.default)(auctionHouseSdk, connection, {
            expectNull: false,
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        yield (0, resetTradeState_1.default)(auctionHouseSdk, connection, {
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        // Create trade state manually for seller
        yield createTradeState(AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale, seller.publicKey);
        // Bidder places bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.InstantSale, false);
        // Sale should execute without issues
        yield expect(executeSaleHelper(AuctionHouse_1.BUY_PRICE, undefined)).resolves.not.toThrow();
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
    }));
    it("buyer cannot execute sale if sale type is not auction", () => __awaiter(void 0, void 0, void 0, function* () {
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE, SaleType_1.default.Auction);
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Auction, false);
        // Sale should not execute with auction sale type and buyer as signer
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "SellerOrAuctionHouseMustSign",
            fn: () => executeSaleHelper(AuctionHouse_1.BUY_PRICE, buyer),
        });
        // Sale should execute for auction sale type if authority signs
        yield expect(executeSaleHelper(AuctionHouse_1.BUY_PRICE, undefined)).resolves.not.toThrow();
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
    }));
    it("buyer can execute sale if sale type is instant sale", () => __awaiter(void 0, void 0, void 0, function* () {
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE, SaleType_1.default.InstantSale);
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.InstantSale, false);
        // Sale should execute for auction sale type if authority signs
        yield expect(executeSaleHelper(AuctionHouse_1.BUY_PRICE, buyer)).resolves.not.toThrow();
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
    }));
    it("can execute sale with 'old' trade states (testing for backwards compatibility)", () => __awaiter(void 0, void 0, void 0, function* () {
        // Call sell and buy ixs directly to use 'old' trade states rather than new ones
        // that are created using createTradeState
        const sellIx = yield (0, auctionHouseSellIx_1.default)({
            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseProgramId: auctionHouseSdk.program.programId,
            authority: auctionHouseSdk.walletAuthority,
            feeAccount: auctionHouseSdk.feeAccount,
            priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            program: auctionHouseSdk.program,
            tokenAccount,
            tokenMint,
            treasuryMint: auctionHouseSdk.treasuryMint,
            walletSeller: seller.publicKey,
        }, {});
        yield (0, sendTransactionWithWallet_1.default)(connection, (0, formfunction_program_shared_1.ixToTx)(sellIx), seller);
        // Trade state should exist but sale type will not be set
        yield (0, verifyTradeState_1.default)(auctionHouseSdk, connection, {
            expectNull: false,
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: seller.publicKey,
        });
        const buyIx = yield (0, auctionHouseBuyV2Ix_1.default)({
            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseProgramId: auctionHouseSdk.program.programId,
            authority: auctionHouseSdk.walletAuthority,
            feeAccount: auctionHouseSdk.feeAccount,
            previousBidderRefundAccount: yield (0, getWalletIfNativeElseAta_1.default)(buyer.publicKey, auctionHouseSdk.treasuryMint),
            previousBidderWallet: buyer.publicKey,
            priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            program: auctionHouseSdk.program,
            tokenAccount,
            tokenMint,
            treasuryMint: auctionHouseSdk.treasuryMint,
            walletBuyer: buyer.publicKey,
        }, {});
        yield (0, sendTransactionWithWallet_1.default)(connection, (0, formfunction_program_shared_1.ixToTx)(buyIx), buyer);
        // Trade state should exist but sale type will not be set
        yield (0, verifyTradeState_1.default)(auctionHouseSdk, connection, {
            expectNull: false,
            priceInSol: AuctionHouse_1.BUY_PRICE,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        });
        // Sale should execute without issues
        yield expect(executeSaleHelper(AuctionHouse_1.BUY_PRICE, undefined)).resolves.not.toThrow();
        // Transfer it back
        yield (0, formfunction_program_shared_1.transfer)(connection, buyer, buyerTokenAccount, tokenMint, tokenAccount);
    }));
});
//# sourceMappingURL=tradeState.test.js.map