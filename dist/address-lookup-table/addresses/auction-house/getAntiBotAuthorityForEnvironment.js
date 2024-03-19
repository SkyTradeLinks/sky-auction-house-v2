"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
function getAntiBotAuthorityForEnvironment(environment) {
    switch (environment) {
        case formfunction_program_shared_1.Environment.Local:
        case formfunction_program_shared_1.Environment.Testnet:
        case formfunction_program_shared_1.Environment.Development:
            return formfunction_program_shared_1.ANTI_BOT_DEV_AUTHORITY;
        case formfunction_program_shared_1.Environment.Production:
            return formfunction_program_shared_1.ANTI_BOT_MAINNET_AUTHORITY;
        default: {
            return (0, formfunction_program_shared_1.assertUnreachable)(environment);
        }
    }
}
exports.default = getAntiBotAuthorityForEnvironment;
//# sourceMappingURL=getAntiBotAuthorityForEnvironment.js.map