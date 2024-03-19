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
const fs_1 = require("fs");
const findNftTxs_1 = __importDefault(require("tests/utils/txs/findNftTxs"));
function getNftTxs(connection, tokenMint, waitMs, parsedTxsOutput) {
    return __awaiter(this, void 0, void 0, function* () {
        if (waitMs != null) {
            (0, formfunction_program_shared_1.logIfDebug)("waiting...");
            yield new Promise((resolve) => setTimeout(() => resolve(), waitMs));
        }
        const txs = yield connection.getConfirmedSignaturesForAddress2(tokenMint, undefined, "confirmed");
        const signatures = txs.map((tx) => tx.signature);
        const parsedTxs = yield connection.getParsedTransactions(signatures, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        if (parsedTxsOutput != null) {
            (0, formfunction_program_shared_1.logIfDebug)(`found ${parsedTxs.length} txs for mint ${tokenMint.toString()}`);
            const filename = `test-txs-json/${parsedTxsOutput}`;
            (0, fs_1.writeFileSync)(filename, JSON.stringify(parsedTxs, null, 2));
        }
        return (0, findNftTxs_1.default)(parsedTxs, signatures, tokenMint);
    });
}
exports.default = getNftTxs;
