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
const fundPayerKeypair_1 = __importDefault(require("address-lookup-table/utils/fundPayerKeypair"));
const getAuthorityKeypair_1 = __importDefault(require("address-lookup-table/utils/getAuthorityKeypair"));
function handleCreateTable(environment, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const slot = yield connection.getSlot({ commitment: "confirmed" });
        const authorityKeypair = (0, getAuthorityKeypair_1.default)(environment);
        const authority = authorityKeypair.publicKey;
        yield (0, fundPayerKeypair_1.default)(connection, environment, authorityKeypair);
        console.log(`Creating address lookup table in environment: ${environment} with authority: ${authority}`);
        const [transactionInstruction, lookupTableAddress] = web3_js_1.AddressLookupTableProgram.createLookupTable({
            authority,
            payer: authority,
            recentSlot: slot,
        });
        const transaction = (0, formfunction_program_shared_1.ixToTx)(transactionInstruction);
        try {
            const txid = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
                authorityKeypair,
            ]);
            console.log("Created address lookup table:");
            console.log(`txid = ${txid}`);
            console.log(`table address = ${lookupTableAddress.toString()}`);
            return lookupTableAddress;
        }
        catch (err) {
            console.log(`Error running ${handleCreateTable.name}:`);
            console.log(err);
            throw err;
        }
    });
}
exports.default = handleCreateTable;
//# sourceMappingURL=handleCreateTable.js.map