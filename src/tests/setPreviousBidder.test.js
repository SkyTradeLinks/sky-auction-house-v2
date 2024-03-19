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
const buy_1 = __importDefault(require("tests/utils/buy"));
const expectTransactionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectTransactionToFailWithErrorCode"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const sell_1 = __importDefault(require("tests/utils/sell"));
let tokenMint;
let tokenAccount;
let _buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let buyers;
let seller;
let buyer;
const connection = (0, getConnectionForTest_1.default)();
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
describe("setPreviousBidder tests", () => {
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
            treasuryMint: yield (0, getTreasuryMint_1.default)(),
        }, Wallets_1.WALLET_CREATOR);
        seller = sellers[0];
        buyer = buyers[0];
    }));
    it("set previous bidder fails if auction started and previous bidder is not null", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // List
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE / 10);
        // Bid
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE / 10, tokenMint, tokenAccount, buyer, buyer.publicKey);
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const lastBidPriceAccountBefore = yield programCreator.account.lastBidPrice.fetch(lastBidPrice);
        expect(lastBidPriceAccountBefore.price.toNumber()).toEqual((AuctionHouse_1.BUY_PRICE / 10) * web3_js_1.LAMPORTS_PER_SOL);
        expect((_a = lastBidPriceAccountBefore.bidder) === null || _a === void 0 ? void 0 : _a.equals(buyer.publicKey)).toEqual(true);
        const tx = yield auctionHouseSdk.setPreviousBidderTx({
            tokenMint,
        }, { bidder: null });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "CannotOverrideBidderAuctionInProgress",
            signers: [Wallets_1.WALLET_CREATOR],
            transaction: tx,
        });
    }));
});
