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
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const Wallets_1 = require("tests/constants/Wallets");
const setup_1 = require("tests/setup");
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const TREASURY_MINT = formfunction_program_shared_1.WRAPPED_SOL_MINT;
let splTokenMintKeypair = null;
const connection = (0, getConnectionForTest_1.default)();
function getTreasuryMint(isNativeOverride) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isNativeOverride === true || (isNativeOverride == null && setup_1.IS_NATIVE)) {
            return TREASURY_MINT;
        }
        if (splTokenMintKeypair != null) {
            return splTokenMintKeypair.publicKey;
        }
        // Initialize if not initialized yet
        // TODO: consider factoring out into a separate method e.g., initializeTreasuryMint
        splTokenMintKeypair = web3_js_1.Keypair.generate();
        const minRentLamports = yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span);
        const createAccountIx = web3_js_1.SystemProgram.createAccount({
            fromPubkey: Wallets_1.WALLET_SPL_TOKEN_MINT_AUTHORITY.publicKey,
            lamports: minRentLamports,
            newAccountPubkey: splTokenMintKeypair.publicKey,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
            space: spl_token_1.MintLayout.span,
        });
        const initializeMintIx = (0, spl_token_1.createInitializeMintInstruction)(splTokenMintKeypair.publicKey, AuctionHouse_1.SPL_TOKEN_DECIMALS, Wallets_1.WALLET_SPL_TOKEN_MINT_AUTHORITY.publicKey, null);
        yield (0, sendTransactionWithWallet_1.default)(connection, (0, formfunction_program_shared_1.ixsToTx)([createAccountIx, initializeMintIx]), Wallets_1.WALLET_SPL_TOKEN_MINT_AUTHORITY, [splTokenMintKeypair]);
        return splTokenMintKeypair.publicKey;
    });
}
exports.default = getTreasuryMint;
//# sourceMappingURL=getTreasuryMint.js.map