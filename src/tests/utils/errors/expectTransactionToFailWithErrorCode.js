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
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
/**
 * A wrapper around expectFunctionToFailWithErrorCode which expects a transaction,
 * rather than an arbitrary function, to fail with a specific program error code.
 */
function expectTransactionToFailWithErrorCode({ connection, errorName, options, signers, transaction, }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName,
            fn: () => (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, signers, options),
        });
    });
}
exports.default = expectTransactionToFailWithErrorCode;
