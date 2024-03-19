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
const fetchAndPrintAddressLookupTable_1 = __importDefault(require("address-lookup-table/utils/fetchAndPrintAddressLookupTable"));
const getEnvironmentAndConnectionForScript_1 = __importDefault(require("address-lookup-table/utils/getEnvironmentAndConnectionForScript"));
const handleCreateTable_1 = __importDefault(require("address-lookup-table/utils/handleCreateTable"));
const parseScriptArgs_1 = __importDefault(require("address-lookup-table/utils/parseScriptArgs"));
const writeAddressLookupTableToDisk_1 = __importDefault(require("address-lookup-table/utils/writeAddressLookupTableToDisk"));
function createTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const { connection, environment } = (0, getEnvironmentAndConnectionForScript_1.default)();
        const tableAddress = yield (0, handleCreateTable_1.default)(environment, connection);
        yield (0, fetchAndPrintAddressLookupTable_1.default)(connection, tableAddress);
        // Save generated table address to disk (e.g. for local program tests) if
        // flag to do so was set when this script was run.
        const { saveTableAddressFilename } = (0, parseScriptArgs_1.default)();
        if (saveTableAddressFilename != null) {
            (0, writeAddressLookupTableToDisk_1.default)(tableAddress, saveTableAddressFilename);
        }
    });
}
createTable();
//# sourceMappingURL=createTable.js.map