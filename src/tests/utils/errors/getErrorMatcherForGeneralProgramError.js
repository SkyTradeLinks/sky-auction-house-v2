"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const GeneralProgramError_1 = require("tests/constants/GeneralProgramError");
const errorCodeToHexString_1 = __importDefault(require("tests/utils/errors/errorCodeToHexString"));
const errorNumberToHexString_1 = __importDefault(require("tests/utils/errors/errorNumberToHexString"));
/**
 * Maps a general program error to the specific RegExp pattern to match the error
 * which is thrown in the test. To figure this out for some new future error,
 * run the tests in DEBUG mode and dig through the error logs.
 */
function getErrorMatcherForGeneralProgramError(generalProgramError) {
    switch (generalProgramError) {
        case GeneralProgramError_1.SIGNATURE_VERIFICATION_FAILED:
            return "Signature verification failed";
        case GeneralProgramError_1.MISSING_ACCOUNT:
            return "An account required by the instruction is missing";
        case GeneralProgramError_1.CONSTRAINT_HAS_ONE:
            return (0, errorCodeToHexString_1.default)(2001);
        case GeneralProgramError_1.CONSTRAINT_SEEDS:
            return (0, errorCodeToHexString_1.default)(2006);
        case GeneralProgramError_1.ACCOUNT_IS_FROZEN:
            return (0, errorNumberToHexString_1.default)(0x11);
        case GeneralProgramError_1.EDITION_NUMBER_GREATER_THAN_MAX_SUPPLY:
            return (0, errorNumberToHexString_1.default)(0x7a);
        default:
            return (0, formfunction_program_shared_1.assertUnreachable)(generalProgramError);
    }
}
exports.default = getErrorMatcherForGeneralProgramError;
