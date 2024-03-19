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
const handleExtendTable_1 = __importDefault(require("address-lookup-table/utils/handleExtendTable"));
const parseScriptArgs_1 = __importDefault(require("address-lookup-table/utils/parseScriptArgs"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
function extendTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const { tableAddress } = (0, parseScriptArgs_1.default)();
        (0, tiny_invariant_1.default)(tableAddress != null);
        const { environment, connection } = (0, getEnvironmentAndConnectionForScript_1.default)();
        yield (0, handleExtendTable_1.default)(environment, connection, tableAddress);
        yield (0, fetchAndPrintAddressLookupTable_1.default)(connection, tableAddress);
    });
}
extendTable();
