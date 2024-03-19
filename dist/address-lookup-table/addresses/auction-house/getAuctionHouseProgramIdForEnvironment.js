"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
function getAuctionHouseProgramIdForEnvironment(environment) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Local:
            return new web3_js_1.PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
        case formfunction_program_shared_1.Environment.Testnet:
            return new web3_js_1.PublicKey("jzmdMPJhm7Txb2RzYPte6Aj1QWqFarmjsJuWjk9m2wv");
        case formfunction_program_shared_1.Environment.Development:
            return new web3_js_1.PublicKey("devmBQyHHBPiLcuCqbWWRYxCG33ntAfPD5nXZeLd4eX");
        case formfunction_program_shared_1.Environment.Production:
            return new web3_js_1.PublicKey("formn3hJtt8gvVKxpCfzCJGuoz6CNUFcULFZW18iTpC");
        default: {
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
        }
    }
}
exports.default = getAuctionHouseProgramIdForEnvironment;
//# sourceMappingURL=getAuctionHouseProgramIdForEnvironment.js.map