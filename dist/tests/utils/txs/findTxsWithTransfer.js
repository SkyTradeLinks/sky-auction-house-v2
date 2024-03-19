"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const parseTxWithTransfer_1 = __importDefault(require("tests/utils/txs/parse/parseTxWithTransfer"));
function findTxsWithTransfer(txs, signatures, tokenMint) {
    return (0, formfunction_program_shared_1.filterNulls)(txs.map((tx, index) => {
        if (tx == null) {
            return null;
        }
        return (0, parseTxWithTransfer_1.default)(tx, signatures[index], tokenMint);
    }));
}
exports.default = findTxsWithTransfer;
//# sourceMappingURL=findTxsWithTransfer.js.map