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
const GeneralProgramError_1 = require("tests/constants/GeneralProgramError");
const errorCodeToHexString_1 = __importDefault(require("tests/utils/errors/errorCodeToHexString"));
const getErrorCodeFromErrorName_1 = __importDefault(require("tests/utils/errors/getErrorCodeFromErrorName"));
const getErrorMatcherForGeneralProgramError_1 = __importDefault(require("tests/utils/errors/getErrorMatcherForGeneralProgramError"));
function expectFunctionToFailWithErrorCode({ errorName, fn, }) {
    return __awaiter(this, void 0, void 0, function* () {
        let originalError = null;
        const tryCatchWrapper = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield fn();
            }
            catch (e) {
                originalError = e;
                throw e;
            }
        });
        try {
            switch (errorName) {
                case GeneralProgramError_1.SIGNATURE_VERIFICATION_FAILED:
                case GeneralProgramError_1.CONSTRAINT_SEEDS:
                case GeneralProgramError_1.CONSTRAINT_HAS_ONE:
                case GeneralProgramError_1.MISSING_ACCOUNT:
                case GeneralProgramError_1.ACCOUNT_IS_FROZEN:
                case GeneralProgramError_1.EDITION_NUMBER_GREATER_THAN_MAX_SUPPLY: {
                    yield expect(tryCatchWrapper()).rejects.toThrow((0, getErrorMatcherForGeneralProgramError_1.default)(errorName));
                    break;
                }
                default: {
                    const errorCode = (0, getErrorCodeFromErrorName_1.default)(errorName);
                    yield expect(tryCatchWrapper()).rejects.toThrow((0, errorCodeToHexString_1.default)(errorCode));
                }
            }
        }
        catch (err) {
            /**
             * If this catch block runs it means either the transaction did not fail
             * or the rejects.toThrow assertion failed, which probably means the
             * transaction failed in an unexpected way. If either happens we log
             * additional debugging info here.
             */
            if (originalError == null) {
                console.log(`Expected function to fail with error "${errorName}" but it did not fail.`);
            }
            else {
                console.log(`Received unexpected error in ${expectFunctionToFailWithErrorCode.name} when expecting a failure with errorName "${errorName}", original error:`);
                console.log(originalError);
            }
            throw err;
        }
    });
}
exports.default = expectFunctionToFailWithErrorCode;
