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
const findLastBidPrice_1 = __importDefault(require("solana/pdas/findLastBidPrice"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const expectTransactionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectTransactionToFailWithErrorCode"));
const expectEqPubkeys_1 = __importDefault(require("tests/utils/expectEqPubkeys"));
const getBalance_1 = __importDefault(require("tests/utils/getBalance"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const getTreasuryWithdrawalDestination_1 = __importDefault(require("tests/utils/getTreasuryWithdrawalDestination"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
// NOTE: use existing tokenMint to make test faster.
// Use new tokenMint to test everything from scratch.
// let tokenMint: PublicKey = new PublicKey(
//   "2VkhToHLLb3jwZRwmsbx74wVf3i5UHziSU7Fjyp19V9W"
// );
let tokenMint;
let tokenAccount;
let _buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let buyers;
let seller;
let buyer;
const connection = (0, getConnectionForTest_1.default)();
// Use different auction house to avoid messing up other tests
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
/**
 * IMPORTANT: ALWAYS RUN THIS TEST IN ISOLATION
 *
 * Since this test does things like deposit/withdraw from
 * the fee/treasury accounts, running it in parallel with other
 * tests may lead to random failures (e.g., if you expect a certain
 * amount to be in the treasury balance, it may differ from the
 * actual amount if this test withdraws at the same time)
 */
describe("misc tests (create, update, deposit, withdraw)", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        [
            auctionHouseSdk,
            _buyerTokenAccount,
            tokenAccount,
            tokenMint,
            sellers,
            buyers,
        ] = yield (0, getTestSetup_1.default)(connection, {
            basisPoints: AuctionHouse_1.BASIS_POINTS,
            basisPointsSecondary: AuctionHouse_1.BASIS_POINTS_SECONDARY,
            creator: programCreator,
            feeWithdrawalDestination: Wallets_1.WALLET_CREATOR.publicKey,
            treasuryMint: yield (0, getTreasuryMint_1.default)(),
            treasuryWithdrawalDestinationOwner: Wallets_1.WALLET_CREATOR.publicKey,
        }, Wallets_1.WALLET_CREATOR);
        buyer = buyers[0];
        seller = sellers[0];
    }));
    it("is auction house created", () => __awaiter(void 0, void 0, void 0, function* () {
        const auctionHouseObj = yield programCreator.account.auctionHouse.fetch(auctionHouseSdk.auctionHouse);
        const { treasuryWithdrawalDestination } = yield (0, getTreasuryWithdrawalDestination_1.default)(Wallets_1.WALLET_CREATOR.publicKey);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.auctionHouseFeeAccount, auctionHouseSdk.feeAccount);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.auctionHouseTreasury, auctionHouseSdk.treasuryAccount);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.treasuryWithdrawalDestination, treasuryWithdrawalDestination);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.feeWithdrawalDestination, Wallets_1.WALLET_CREATOR.publicKey);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.treasuryMint, yield (0, getTreasuryMint_1.default)());
        (0, expectEqPubkeys_1.default)(auctionHouseObj.authority, Wallets_1.WALLET_CREATOR.publicKey);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.creator, Wallets_1.WALLET_CREATOR.publicKey);
        expect(auctionHouseObj.bump).toEqual(auctionHouseSdk.auctionHouseBump);
        expect(auctionHouseObj.treasuryBump).toEqual(auctionHouseSdk.treasuryBump);
        expect(auctionHouseObj.feePayerBump).toEqual(auctionHouseSdk.feeBump);
        expect(auctionHouseObj.sellerFeeBasisPoints).toEqual(AuctionHouse_1.BASIS_POINTS);
        expect(auctionHouseObj.requiresSignOff).toEqual(false);
        expect(auctionHouseObj.canChangeSalePrice).toEqual(false);
        expect(auctionHouseObj.payAllFees).toEqual(true);
    }));
    it("create last bid price", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const tx = yield auctionHouseSdk.createLastBidPriceTx({
            tokenMint,
            wallet: Wallets_1.WALLET_CREATOR.publicKey,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, Wallets_1.WALLET_CREATOR);
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccount = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount.price.toString()).toEqual("0");
        expect((_a = lastBidPriceAccount.bidder) === null || _a === void 0 ? void 0 : _a.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
        expect(lastBidPriceAccount.hasBeenSold).toEqual(0);
    }));
    it("create trade state", () => __awaiter(void 0, void 0, void 0, function* () {
        const tx = yield auctionHouseSdk.createTradeStateTx({
            priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            saleType: SaleType_1.default.InstantSale,
            tokenAccount,
            tokenMint,
            wallet: Wallets_1.WALLET_CREATOR.publicKey,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, Wallets_1.WALLET_CREATOR);
        const [tradeState, tradeStateBump] = yield auctionHouseSdk.findTradeState(Wallets_1.WALLET_CREATOR.publicKey, tokenAccount, tokenMint, AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL);
        const tradeStateAccount = yield connection.getAccountInfo(tradeState);
        expect(Number(tradeStateAccount.data[0])).toEqual(tradeStateBump);
        expect(tradeStateAccount.data[1]).toEqual(SaleType_1.default.InstantSale);
    }));
    it("set previous bidder", () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccount1 = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect((_b = lastBidPriceAccount1.bidder) === null || _b === void 0 ? void 0 : _b.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
        const tx1 = yield auctionHouseSdk.setPreviousBidderTx({
            tokenMint,
        }, { bidder: buyer.publicKey });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx1, Wallets_1.WALLET_CREATOR);
        const lastBidPriceAccount2 = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount2.bidder.toString()).toEqual(buyer.publicKey.toString());
        const tx2 = yield auctionHouseSdk.setPreviousBidderTx({
            tokenMint,
        }, { bidder: null });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx2, Wallets_1.WALLET_CREATOR);
        const lastBidPriceAccount3 = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect((_c = lastBidPriceAccount3.bidder) === null || _c === void 0 ? void 0 : _c.equals(AuctionHouse_1.ZERO_PUBKEY)).toEqual(true);
    }));
    it("set has been sold", () => __awaiter(void 0, void 0, void 0, function* () {
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccount = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount.hasBeenSold).toEqual(0);
        const tx1 = yield auctionHouseSdk.setHasBeenSoldTx({
            tokenMint,
        }, { hasBeenSold: true });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx1, Wallets_1.WALLET_CREATOR);
        const lastBidPriceAccount2 = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount2.hasBeenSold).toEqual(1);
    }));
    it("set tick size", () => __awaiter(void 0, void 0, void 0, function* () {
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccount = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount.tickSizeConstantInLamports.toNumber()).toEqual(0);
        const tickSize1 = 1e8;
        const tx1 = yield auctionHouseSdk.setTickSizeTx({
            owner: seller.publicKey,
            tokenAccount,
            tokenMint,
        }, { tickSizeConstantInLamports: tickSize1 });
        // Use authority as signer
        yield (0, sendTransactionWithWallet_1.default)(connection, tx1, Wallets_1.WALLET_CREATOR);
        const lastBidPriceAccount2 = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount2.tickSizeConstantInLamports.toNumber()).toEqual(tickSize1);
        const tickSize2 = 2e8;
        const tx2 = yield auctionHouseSdk.setTickSizeTx({
            owner: seller.publicKey,
            tokenAccount,
            tokenMint,
        }, { tickSizeConstantInLamports: tickSize2 });
        // Use owner as signer
        yield (0, sendTransactionWithWallet_1.default)(connection, tx2, seller);
        const lastBidPriceAccount3 = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccount3.tickSizeConstantInLamports.toNumber()).toEqual(tickSize2);
        const tickSize3 = 1e7;
        const tx3 = yield auctionHouseSdk.setTickSizeTx({
            owner: seller.publicKey,
            tokenAccount,
            tokenMint,
        }, { tickSizeConstantInLamports: tickSize3 });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "TickSizeTooLow",
            signers: [seller],
            transaction: tx3,
        });
    }));
    it("deposit/withdraw", () => __awaiter(void 0, void 0, void 0, function* () {
        const [escrowPaymentAccount] = yield auctionHouseSdk.findBuyerEscrow(buyer.publicKey, tokenMint);
        const amount = 2;
        const amountHalf = amount / 2;
        const escrowBalanceBefore = yield (0, getBalance_1.default)(connection, {
            account: escrowPaymentAccount,
        });
        const depositTx = yield auctionHouseSdk.depositTx({
            tokenMint,
            transferAuthority: buyer.publicKey,
            wallet: buyer.publicKey,
        }, { amount: amount * web3_js_1.LAMPORTS_PER_SOL });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, depositTx, [buyer]);
        const escrowBalanceAfterDeposit = yield (0, getBalance_1.default)(connection, {
            account: escrowPaymentAccount,
        });
        const escrowBalanceDiff = escrowBalanceAfterDeposit - escrowBalanceBefore;
        expect(escrowBalanceDiff).toEqual(amount * web3_js_1.LAMPORTS_PER_SOL);
        // Try withdrawing as buyer
        const withdrawTx = yield auctionHouseSdk.withdrawTx({
            tokenMint,
            wallet: buyer.publicKey,
        }, { amount: amountHalf * web3_js_1.LAMPORTS_PER_SOL });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, withdrawTx, [buyer]);
        // Try withdrawing as authority
        const withdrawTx2 = yield auctionHouseSdk.withdrawTx({
            tokenMint,
            wallet: buyer.publicKey,
        }, { amount: amountHalf * web3_js_1.LAMPORTS_PER_SOL });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, withdrawTx2, [Wallets_1.WALLET_CREATOR]);
        const escrowBalanceAfterWithdraw = yield (0, getBalance_1.default)(connection, {
            account: escrowPaymentAccount,
        });
        const escrowBalanceDiff2 = escrowBalanceAfterWithdraw - escrowBalanceAfterDeposit;
        expect(escrowBalanceDiff2).toEqual(-amount * web3_js_1.LAMPORTS_PER_SOL);
    }));
    it("update auction house", () => __awaiter(void 0, void 0, void 0, function* () {
        const { treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, } = yield (0, getTreasuryWithdrawalDestination_1.default)();
        const tx = yield auctionHouseSdk.updateTx({
            feeWithdrawalDestination: AuctionHouse_1.FEE_WITHDRAWAL_DESTINATION,
            newAuthority: Wallets_1.WALLET_CREATOR.publicKey,
            payer: Wallets_1.WALLET_CREATOR.publicKey,
            treasuryWithdrawalDestination,
            treasuryWithdrawalDestinationOwner,
        }, {
            basisPoints: AuctionHouse_1.BASIS_POINTS * 2,
            basisPointsSecondary: AuctionHouse_1.BASIS_POINTS_SECONDARY * 2,
            canChangePrice: true,
            payAllFees: false,
            requiresSignOff: true,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, Wallets_1.WALLET_CREATOR);
        const auctionHouseObj = yield programCreator.account.auctionHouse.fetch(auctionHouseSdk.auctionHouse);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.auctionHouseFeeAccount, auctionHouseSdk.feeAccount);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.auctionHouseTreasury, auctionHouseSdk.treasuryAccount);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.treasuryWithdrawalDestination, treasuryWithdrawalDestination);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.feeWithdrawalDestination, AuctionHouse_1.FEE_WITHDRAWAL_DESTINATION);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.treasuryMint, yield (0, getTreasuryMint_1.default)());
        (0, expectEqPubkeys_1.default)(auctionHouseObj.authority, Wallets_1.WALLET_CREATOR.publicKey);
        (0, expectEqPubkeys_1.default)(auctionHouseObj.creator, Wallets_1.WALLET_CREATOR.publicKey);
        expect(auctionHouseObj.bump).toEqual(auctionHouseSdk.auctionHouseBump);
        expect(auctionHouseObj.treasuryBump).toEqual(auctionHouseSdk.treasuryBump);
        expect(auctionHouseObj.feePayerBump).toEqual(auctionHouseSdk.feeBump);
        expect(auctionHouseObj.sellerFeeBasisPoints).toEqual(AuctionHouse_1.BASIS_POINTS * 2);
        expect(auctionHouseObj.requiresSignOff).toEqual(true);
        expect(auctionHouseObj.canChangeSalePrice).toEqual(true);
        expect(auctionHouseObj.payAllFees).toEqual(false);
        expect(auctionHouseObj.sellerFeeBasisPointsSecondary).toEqual(AuctionHouse_1.BASIS_POINTS_SECONDARY * 2);
    }));
});
