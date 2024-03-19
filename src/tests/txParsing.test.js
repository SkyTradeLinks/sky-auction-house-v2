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
const Wallets_1 = require("tests/constants/Wallets");
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getNftTxs_1 = __importDefault(require("tests/utils/txs/getNftTxs"));
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // Create mint account
        //
        (0, formfunction_program_shared_1.logIfDebug)("creating token mint");
        const tokenMint = yield (0, formfunction_program_shared_1.createNftMint)(connection, Wallets_1.WALLET_SELLER);
        (0, formfunction_program_shared_1.logIfDebug)(`token mint created at ${tokenMint.toString()}`);
        //
        // Create ATA
        //
        const tokenAccountSeller = yield (0, formfunction_program_shared_1.createAtaIfNotExists)(connection, Wallets_1.WALLET_SELLER.publicKey, tokenMint, Wallets_1.WALLET_SELLER, "seller");
        //
        // Mint token to ATA
        //
        const tokenAmount = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, tokenAccountSeller);
        if (tokenAmount === 0) {
            (0, formfunction_program_shared_1.logIfDebug)(`minting one token to ${tokenAccountSeller.toString()}`);
            yield (0, formfunction_program_shared_1.mintTo)(connection, tokenMint, tokenAccountSeller, Wallets_1.WALLET_SELLER.publicKey, [Wallets_1.WALLET_SELLER], 1);
        }
        return { tokenAccountSeller, tokenMint };
    });
}
const connection = (0, getConnectionForTest_1.default)();
describe("tx parsing tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({
            connection,
            wallets: [Wallets_1.WALLET_BUYER, Wallets_1.WALLET_SELLER],
        });
    }));
    it.skip("standalone transfer checked ix", () => __awaiter(void 0, void 0, void 0, function* () {
        const { tokenMint, tokenAccountSeller } = yield setup();
        const tokenAccountBuyer = yield (0, formfunction_program_shared_1.createAtaIfNotExists)(connection, Wallets_1.WALLET_BUYER.publicKey, tokenMint, Wallets_1.WALLET_BUYER, "buyer");
        //
        // Transfer token
        //
        // NOTE: cannot use tokenMintObj.transfer, otherwise transfer tx will not
        // be included in getConfirmedSignaturesForAddress2. Must use "transfer checked" (it's
        // what Phantom uses).
        //
        (0, formfunction_program_shared_1.logIfDebug)("transferring 1 token from seller to buyer");
        const transferCheckedIx = (0, spl_token_1.createTransferCheckedInstruction)(tokenAccountSeller, tokenMint, tokenAccountBuyer, Wallets_1.WALLET_SELLER.publicKey, 1, 0, [Wallets_1.WALLET_SELLER]);
        const tx = new web3_js_1.Transaction();
        tx.add(transferCheckedIx);
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [Wallets_1.WALLET_SELLER]);
        const nftTxs = yield (0, getNftTxs_1.default)(connection, tokenMint, 1000, "txs1.json");
        (0, formfunction_program_shared_1.logIfDebug)("nftTxs", nftTxs);
    }));
    it("transfer + create ATA", () => __awaiter(void 0, void 0, void 0, function* () {
        const { tokenMint, tokenAccountSeller } = yield setup();
        const [tokenAccountBuyer] = (0, formfunction_program_shared_1.findAtaPda)(Wallets_1.WALLET_BUYER.publicKey, tokenMint);
        const ataIx = yield (0, formfunction_program_shared_1.createAtaIx)(tokenMint, Wallets_1.WALLET_BUYER.publicKey, Wallets_1.WALLET_BUYER.publicKey);
        const transferIx = (0, spl_token_1.createTransferInstruction)(tokenAccountSeller, tokenAccountBuyer, Wallets_1.WALLET_SELLER.publicKey, 1, [Wallets_1.WALLET_SELLER]);
        const tx = new web3_js_1.Transaction();
        tx.add(ataIx, transferIx);
        (0, formfunction_program_shared_1.logIfDebug)("creating ATA, and transferring 1 token from seller to buyer");
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [
            Wallets_1.WALLET_BUYER,
            Wallets_1.WALLET_SELLER,
        ]);
        const nftTxs = yield (0, getNftTxs_1.default)(connection, tokenMint, 1000, "txs2.json");
        (0, formfunction_program_shared_1.logIfDebug)("nftTxs", nftTxs);
    }));
});
