"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const parseBuyTx_1 = __importDefault(require("tests/utils/txs/parse/parseBuyTx"));
const parseCancelTx_1 = __importDefault(require("tests/utils/txs/parse/parseCancelTx"));
const parseCreateMintTx_1 = __importDefault(require("tests/utils/txs/parse/parseCreateMintTx"));
const parseExecuteSale_1 = __importDefault(require("tests/utils/txs/parse/parseExecuteSale"));
const parseSellTx_1 = __importDefault(require("tests/utils/txs/parse/parseSellTx"));
const parseTxWithTransfer_1 = __importDefault(require("tests/utils/txs/parse/parseTxWithTransfer"));
function findNftTxs(txs, signatures, tokenMint) {
    return (0, formfunction_program_shared_1.filterNulls)(txs.map((tx, index) => {
        if (tx == null) {
            return null;
        }
        const createMint = (0, parseCreateMintTx_1.default)(tx, signatures[index]);
        if (createMint != null) {
            return createMint;
        }
        const sell = (0, parseSellTx_1.default)(tx, signatures[index], tokenMint);
        if (sell != null) {
            return sell;
        }
        const cancel = (0, parseCancelTx_1.default)(tx, signatures[index], tokenMint);
        if (cancel != null) {
            return cancel;
        }
        const buy = (0, parseBuyTx_1.default)(tx, signatures[index], tokenMint);
        if (buy != null) {
            return buy;
        }
        const executeSale = (0, parseExecuteSale_1.default)(tx, signatures[index], tokenMint);
        if (executeSale != null) {
            return executeSale;
        }
        return (0, parseTxWithTransfer_1.default)(tx, signatures[index], tokenMint);
    }));
}
exports.default = findNftTxs;
//# sourceMappingURL=findNftTxs.js.map