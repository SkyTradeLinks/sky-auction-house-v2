"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
function getAuctionHouseAuthorityForEnvironment(environment) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Local:
            return new web3_js_1.PublicKey("BR4hwUuuwk3WBnQ9ENEbNnGoiDiup7nWgVM24cAg8xMR");
        case formfunction_program_shared_1.Environment.Testnet:
            return new web3_js_1.PublicKey("3YihDrzZz4XPbuZpjwmLeB8U46vBjci4agDYq3WHtn9Y");
        case formfunction_program_shared_1.Environment.Development:
            return new web3_js_1.PublicKey("HSF7CpC5JwthGi6rDymX6hXUvVKDKDthKSb5gME15EWx");
        case formfunction_program_shared_1.Environment.Production:
            return new web3_js_1.PublicKey("2nmN38wUByqTB4hMQ2PVVjbgaqrawNCVEWMCsr3wzhm5");
        default: {
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
        }
    }
}
exports.default = getAuctionHouseAuthorityForEnvironment;
//# sourceMappingURL=getAuctionHouseAuthorityForEnvironment.js.map