"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const ADDRESSES = [formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID];
function getThirdPartyAddresses() {
    return ADDRESSES;
}
exports.default = getThirdPartyAddresses;
