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
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
const connection = (0, getConnectionForTest_1.default)();
describe("close edition distributor token account tests", () => {
    it("close successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, nftOwner, nftOwnerTokenAccount, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const rentReceiver = web3_js_1.Keypair.generate().publicKey;
        const tokenReceiverAmountBefore = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, nftOwnerTokenAccount);
        const rentReceiverAccountBefore = yield connection.getAccountInfo(rentReceiver);
        expect(tokenReceiverAmountBefore).toEqual(0);
        expect(rentReceiverAccountBefore).toBeNull();
        const tx = yield auctionHouseSdk.closeEditionDistributorTokenAccount({
            mint: tokenMint,
            owner: nftOwner.publicKey,
            rentReceiver: rentReceiver,
            tokenReceiver: nftOwnerTokenAccount,
            wallet: nftOwner.publicKey,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, nftOwner);
        const tokenReceiverAmountAfter = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, nftOwnerTokenAccount);
        const rentReceiverAccountAfter = yield connection.getAccountInfo(rentReceiver);
        expect(tokenReceiverAmountAfter).toEqual(1);
        expect(rentReceiverAccountAfter.lamports).toBeGreaterThan(0);
    }));
});
//# sourceMappingURL=closeEditionDistributorTokenAccount.test.js.map