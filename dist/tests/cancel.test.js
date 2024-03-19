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
const findAuctionHouseProgramAsSigner_1 = __importDefault(require("solana/pdas/findAuctionHouseProgramAsSigner"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
const buy_1 = __importDefault(require("tests/utils/buy"));
const expectEqPubkeys_1 = __importDefault(require("tests/utils/expectEqPubkeys"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const sell_1 = __importDefault(require("tests/utils/sell"));
const getNftTxs_1 = __importDefault(require("tests/utils/txs/getNftTxs"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const verifyDelegateAndFrozen_1 = __importDefault(require("tests/utils/verifyDelegateAndFrozen"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
let tokenMint;
let tokenAccount;
let _buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let buyers;
let seller;
let buyer;
const connection = (0, getConnectionForTest_1.default)();
// Use different wallet creator to isolate auction house from other tests
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
describe("cancel tests", () => {
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
    it("cancel", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // Seller lists
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE);
        // Make sure that before cancelling, token account delegate is program as signer
        const tokenAccountInfo = yield (0, formfunction_program_shared_1.getTokenAccountInfo)(connection, tokenAccount);
        const [programAsSigner, _programAsSignerBump] = (0, findAuctionHouseProgramAsSigner_1.default)(programCreator.programId);
        (0, formfunction_program_shared_1.logIfDebug)("before cancel, tokenAccountInfo.delegate", (_a = tokenAccountInfo.delegate) === null || _a === void 0 ? void 0 : _a.toString());
        (0, expectEqPubkeys_1.default)(tokenAccountInfo.delegate, programAsSigner);
        (0, formfunction_program_shared_1.logIfDebug)("cancelling...");
        try {
            const tx = yield auctionHouseSdk.cancelTx({
                priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
                tokenAccount,
                tokenMint,
                wallet: seller.publicKey,
            }, {});
            yield (0, sendTransactionWithWallet_1.default)(connection, tx, seller);
            // Check that token account delegate is no longer program as signer
            yield (0, verifyDelegateAndFrozen_1.default)(connection, tokenMint, tokenAccount, seller, programCreator.programId, false);
            const nftTxs = yield (0, getNftTxs_1.default)(connection, tokenMint, 1000, "afterCancel.json");
            const cancelTx = nftTxs[0];
            expect(cancelTx.fromAddress).toEqual(seller.publicKey.toString());
            expect(cancelTx.toAddress).toEqual(seller.publicKey.toString());
            expect(cancelTx.type).toEqual(NftTransactionType_1.default.ListingCancelled);
        }
        catch (e) {
            (0, formfunction_program_shared_1.logIfDebug)("error cancelling", e);
            throw e;
        }
        // After cancelling, sell again
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE);
    }));
    it("verify that cancelling an offer does not thaw", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, buy_1.default)(connection, auctionHouseSdk, AuctionHouse_1.BUY_PRICE, tokenMint, tokenAccount, buyer, buyer.publicKey, SaleType_1.default.Offer);
        const cancelTx = yield auctionHouseSdk.cancelTx({
            priceInLamports: AuctionHouse_1.BUY_PRICE * web3_js_1.LAMPORTS_PER_SOL,
            tokenAccount,
            tokenMint,
            wallet: buyer.publicKey,
        }, {});
        yield (0, sendTransactionWithWallet_1.default)(connection, cancelTx, Wallets_1.WALLET_CREATOR);
        const [programAsSigner] = yield auctionHouseSdk.findProgramAsSigner();
        yield (0, verifyDelegateAndFrozen_1.default)(connection, tokenMint, tokenAccount, seller, auctionHouseSdk.program.programId, true, programAsSigner);
    }));
});
//# sourceMappingURL=cancel.test.js.map