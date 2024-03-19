"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const AuctionHouseProgramIdls_1 = __importDefault(require("idl/AuctionHouseProgramIdls"));
function decodeAuctionHouseTransaction(programId, parsedTransaction) {
    const decodedTransaction = AuctionHouseProgramIdls_1.default.map((idl) => {
        return (0, formfunction_program_shared_1.decodeTransactionUsingProgramIdl)(idl, programId, parsedTransaction);
    })
        .reverse()
        .reduce((decodedResult, idlResult) => {
        return Object.assign(Object.assign({}, decodedResult), (idlResult !== null && idlResult !== void 0 ? idlResult : {}));
    }, {});
    return decodedTransaction;
}
exports.default = decodeAuctionHouseTransaction;
//# sourceMappingURL=decodeAuctionHouseTransaction.js.map