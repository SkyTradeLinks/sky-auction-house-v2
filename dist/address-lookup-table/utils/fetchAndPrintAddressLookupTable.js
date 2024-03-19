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
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
function fetchAndPrintAddressLookupTable(connection, tableAddress) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const table = yield connection.getAddressLookupTable(tableAddress);
        console.log("\nLookup Table:");
        console.log(JSON.parse((0, formfunction_program_shared_1.jsonStringify)(table)));
        const addresses = (_a = table.value) === null || _a === void 0 ? void 0 : _a.state.addresses;
        if (addresses != null && addresses.length > 0) {
            console.log(`\nLookup Table Addresses (${addresses.length} total):`);
            console.log(addresses.map((val) => val.toString()));
        }
    });
}
exports.default = fetchAndPrintAddressLookupTable;
//# sourceMappingURL=fetchAndPrintAddressLookupTable.js.map