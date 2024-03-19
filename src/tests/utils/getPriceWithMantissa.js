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
const spl_token_1 = require("@solana/spl-token");
function getPriceWithMantissa(price, mint, anchorProgram) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield (0, spl_token_1.getMint)(anchorProgram.provider.connection, mint);
        const mantissa = Math.pow(10, token.decimals);
        return Math.ceil(price * mantissa);
    });
}
exports.default = getPriceWithMantissa;
