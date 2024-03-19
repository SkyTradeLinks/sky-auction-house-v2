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
const handleCreateTable_1 = __importDefault(require("address-lookup-table/utils/handleCreateTable"));
function createAddressLookupTableForTest(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const environment = formfunction_program_shared_1.Environment.Local;
        return (0, handleCreateTable_1.default)(environment, connection);
    });
}
exports.default = createAddressLookupTableForTest;
//# sourceMappingURL=createAddressLookupTableForTest.js.map