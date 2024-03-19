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
function fundPayerKeypair(connection, environment, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (environment) {
            case formfunction_program_shared_1.Environment.Local:
            case formfunction_program_shared_1.Environment.Testnet:
            case formfunction_program_shared_1.Environment.Development:
                yield (0, formfunction_program_shared_1.requestAirdrops)({
                    connection,
                    environment,
                    wallets: [payer],
                });
                return;
            case formfunction_program_shared_1.Environment.Production: {
                const balance = yield connection.getBalance(payer.publicKey);
                if (balance === 0) {
                    throw new Error(`Payer keypair with address ${payer.publicKey} has 0 SOL. Please fund the account first.`);
                }
                return;
            }
            default: {
                return (0, formfunction_program_shared_1.assertUnreachable)(environment);
            }
        }
    });
}
exports.default = fundPayerKeypair;
//# sourceMappingURL=fundPayerKeypair.js.map