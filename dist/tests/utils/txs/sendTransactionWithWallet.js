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
const setup_1 = require("tests/setup");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
function sendVersionedTransaction({ connection, options, signers = [], tx, wallet, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const signersList = [wallet, ...signers];
        // Treat it as a legacy transaction if no ALT address is defined yet.
        if (setup_1.ADDRESS_LOOKUP_TABLE_ADDRESS == null) {
            return (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, signersList, options);
        }
        const addressLookupTable = yield connection.getAddressLookupTable(new web3_js_1.PublicKey(setup_1.ADDRESS_LOOKUP_TABLE_ADDRESS));
        (0, tiny_invariant_1.default)(addressLookupTable.value != null);
        const blockhash = yield connection.getLatestBlockhash();
        const transactionMessage = new web3_js_1.TransactionMessage({
            instructions: tx.instructions,
            payerKey: wallet.publicKey,
            recentBlockhash: blockhash.blockhash,
        }).compileToV0Message([addressLookupTable.value]);
        const transaction = new web3_js_1.VersionedTransaction(transactionMessage);
        transaction.sign(signersList);
        const txid = yield connection.sendTransaction(transaction, options);
        return txid;
    });
}
// [TODO][@]: Refactor to take an object of arguments.
function sendTransactionWithWallet(connection, tx, wallet, signers, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txid = yield sendVersionedTransaction({
                connection,
                options,
                signers,
                tx,
                wallet,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
                signature: txid,
            }, "confirmed");
            if (setup_1.LOG_TX_SIZE) {
                const size = yield (0, formfunction_program_shared_1.estimateTransactionSizeInBytes)(txid, connection);
                console.log(`Estimated transaction size = ${size} bytes.`);
            }
            return txid;
        }
        catch (e) {
            if (setup_1.DEBUG) {
                console.error(e);
            }
            throw e;
        }
    });
}
exports.default = sendTransactionWithWallet;
//# sourceMappingURL=sendTransactionWithWallet.js.map