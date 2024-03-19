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
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
const payer = web3_js_1.Keypair.generate();
const connection = (0, getConnectionForTest_1.default)();
describe("withdraw bonk", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({
            connection,
            wallets: [payer],
        });
    }));
    it("withdraw bonk", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseSdk, editionDistributor, programCreator, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            multipleCreators: true,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        // We'll pretend this is the Bonk token mint
        const token = yield (0, spl_token_1.createMint)(connection, payer, payer.publicKey, payer.publicKey, 0);
        // Create ATAs for the edition distributor and payer
        const editionDistributorAta = yield (0, formfunction_program_shared_1.createAtaIfNotExists)(connection, editionDistributor, token, payer);
        const payerAta = yield (0, formfunction_program_shared_1.createAtaIfNotExists)(connection, payer.publicKey, token, payer);
        // Mint some Bonk tokens to the edition distributor
        yield (0, formfunction_program_shared_1.mintTo)(connection, token, editionDistributorAta, payer.publicKey, [payer], 10);
        // Check balances before the Bonk withdrawal happens
        const editionDistributorBalance = yield connection.getTokenAccountBalance(editionDistributorAta, "processed");
        const payerBalance = yield connection.getTokenAccountBalance(payerAta, "processed");
        expect(Number(editionDistributorBalance.value.amount)).toBe(10);
        expect(Number(payerBalance.value.amount)).toBe(0);
        // Withdraw the Bonk!
        const tx = yield auctionHouseSdk.withdrawBonkTx({
            bonkTokenAccount: editionDistributorAta,
            mint: tokenMint,
            tokenReceiver: payerAta,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, programCreator);
        // Check balances after the Bonk withdrawal happens
        const editionDistributorBalanceAfter = yield connection.getTokenAccountBalance(editionDistributorAta, "processed");
        const payerBalanceAfter = yield connection.getTokenAccountBalance(payerAta, "processed");
        expect(Number(editionDistributorBalanceAfter.value.amount)).toBe(0);
        expect(Number(payerBalanceAfter.value.amount)).toBe(10);
    }));
});
