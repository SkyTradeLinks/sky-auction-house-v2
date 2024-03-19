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
const NftTransactionType_1 = __importDefault(require("tests/types/enums/NftTransactionType"));
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestSetup_1 = __importDefault(require("tests/utils/getTestSetup"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const sell_1 = __importDefault(require("tests/utils/sell"));
const getNftTxs_1 = __importDefault(require("tests/utils/txs/getNftTxs"));
let tokenMint;
let tokenAccount;
let buyerTokenAccount;
let auctionHouseSdk;
let sellers;
let _buyers;
let seller;
const connection = (0, getConnectionForTest_1.default)();
// Use different wallet creator to isolate auction house from other tests
const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
describe("sell tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        [
            auctionHouseSdk,
            buyerTokenAccount,
            tokenAccount,
            tokenMint,
            sellers,
            _buyers,
        ] = yield (0, getTestSetup_1.default)(connection, {
            basisPoints: AuctionHouse_1.BASIS_POINTS,
            basisPointsSecondary: AuctionHouse_1.BASIS_POINTS_SECONDARY,
            creator: programCreator,
            treasuryMint: yield (0, getTreasuryMint_1.default)(),
        }, Wallets_1.WALLET_CREATOR);
        seller = sellers[0];
    }));
    it("sell", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sell_1.default)(connection, auctionHouseSdk, tokenMint, tokenAccount, seller, AuctionHouse_1.BUY_PRICE);
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "Account is frozen",
            fn: () => (0, formfunction_program_shared_1.transfer)(connection, seller, tokenAccount, tokenMint, buyerTokenAccount),
        });
        const nftTxs = yield (0, getNftTxs_1.default)(connection, tokenMint, 1000, "afterSell.json");
        const sellTx = nftTxs[0];
        expect(sellTx.fromAddress).toEqual(seller.publicKey.toString());
        expect(sellTx.toAddress).toEqual(seller.publicKey.toString());
        expect(sellTx.type).toEqual(NftTransactionType_1.default.Listed);
    }));
});
//# sourceMappingURL=sell.test.js.map