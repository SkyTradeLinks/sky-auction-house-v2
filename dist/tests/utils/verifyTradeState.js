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
const web3_js_1 = require("@solana/web3.js");
// See programs/formfn-auction-house/lib.rs
const DEFAULT_TRADE_STATE_SIZE = 130;
function verifyTradeState(sdk, connection, { wallet, tokenAccount, tokenMint, expectNull, priceInSol, saleType, size, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [tradeState, tradeStateBump] = yield sdk.findTradeState(wallet, tokenAccount, tokenMint, priceInSol * web3_js_1.LAMPORTS_PER_SOL);
        const tradeStateAccount = yield connection.getAccountInfo(tradeState);
        if (expectNull) {
            expect(tradeStateAccount).toBe(null);
        }
        else {
            expect(tradeStateAccount.data[0]).toEqual(tradeStateBump);
            if (size != null) {
                expect(tradeStateAccount.data.byteLength).toEqual(size !== null && size !== void 0 ? size : DEFAULT_TRADE_STATE_SIZE);
                if (size > 1) {
                    expect(tradeStateAccount.data[1]).toEqual(saleType !== null && saleType !== void 0 ? saleType : 0);
                }
            }
        }
    });
}
exports.default = verifyTradeState;
//# sourceMappingURL=verifyTradeState.js.map