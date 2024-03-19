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
const buffer_1 = require("buffer");
const fs_1 = __importDefault(require("fs"));
const process_1 = __importDefault(require("process"));
/**
 * Node only wallet.
 */
class NodeWallet {
    constructor(payer) {
        this.payer = payer;
    }
    static local() {
        const ANCHOR_WALLET = process_1.default.env.ANCHOR_WALLET;
        if (ANCHOR_WALLET == null) {
            throw new Error("process.env.ANCHOR_WALLET not defined");
        }
        const payer = web3_js_1.Keypair.fromSecretKey(buffer_1.Buffer.from(JSON.parse(fs_1.default.readFileSync(ANCHOR_WALLET, {
            encoding: "utf-8",
        }))));
        return new NodeWallet(payer);
    }
    signTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            tx.partialSign(this.payer);
            return tx;
        });
    }
    signAllTransactions(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            return txs.map((t) => {
                t.partialSign(this.payer);
                return t;
            });
        });
    }
    get publicKey() {
        return this.payer.publicKey;
    }
}
exports.default = NodeWallet;
