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
const getAddressesForEnvironment_1 = __importDefault(require("address-lookup-table/addresses/getAddressesForEnvironment"));
const fetchAndPrintAddressLookupTable_1 = __importDefault(require("address-lookup-table/utils/fetchAndPrintAddressLookupTable"));
const fundPayerKeypair_1 = __importDefault(require("address-lookup-table/utils/fundPayerKeypair"));
const getAuthorityKeypair_1 = __importDefault(require("address-lookup-table/utils/getAuthorityKeypair"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
function handleExtendTable(environment, connection, tableAddress, auctionHouseOverrideForTest) {
    return __awaiter(this, void 0, void 0, function* () {
        const lookupTable = yield connection.getAddressLookupTable(tableAddress);
        (0, tiny_invariant_1.default)(lookupTable.value != null);
        const currentLookupTableAddresses = new Set(lookupTable.value.state.addresses.map((val) => val.toString()));
        const addressesNotInTable = (yield (0, getAddressesForEnvironment_1.default)(environment, auctionHouseOverrideForTest)).filter((val) => !currentLookupTableAddresses.has(val.toString()));
        if (addressesNotInTable.length === 0) {
            console.log("No addresses to add. Printing current table state and exiting.");
            yield (0, fetchAndPrintAddressLookupTable_1.default)(connection, tableAddress);
            return;
        }
        console.log(`Extending address lookup table at address ${tableAddress} with the following new addresses:`);
        console.log(addressesNotInTable.map((val) => val.toString()));
        const authorityKeypair = (0, getAuthorityKeypair_1.default)(environment);
        yield (0, fundPayerKeypair_1.default)(connection, environment, authorityKeypair);
        // Each extendLookupTable transaction is limited to about 20 addresses or so.
        const addressChunks = (0, formfunction_program_shared_1.chunkArray)(addressesNotInTable, 20);
        yield (0, formfunction_program_shared_1.forEachAsync)(addressChunks, (addresses, index) => __awaiter(this, void 0, void 0, function* () {
            const extendTableInstruction = web3_js_1.AddressLookupTableProgram.extendLookupTable({
                addresses,
                authority: authorityKeypair.publicKey,
                lookupTable: tableAddress,
                payer: authorityKeypair.publicKey,
            });
            const transaction = (0, formfunction_program_shared_1.ixToTx)(extendTableInstruction);
            try {
                const txid = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
                    authorityKeypair,
                ]);
                console.log(`extendLookupTable txid #${index + 1} = ${txid}`);
            }
            catch (err) {
                console.log(`Error in ${handleExtendTable.name}:`);
                console.log(err);
                throw err;
            }
        }));
    });
}
exports.default = handleExtendTable;
//# sourceMappingURL=handleExtendTable.js.map