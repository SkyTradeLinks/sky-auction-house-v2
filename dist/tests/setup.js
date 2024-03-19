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
exports.ADDRESS_LOOKUP_TABLE_ADDRESS = exports.LOG_TX_SIZE = exports.IS_NATIVE = exports.DEBUG = void 0;
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
const readAddressLookupTableFromDisk_1 = __importDefault(require("address-lookup-table/utils/readAddressLookupTableFromDisk"));
const Wallets_1 = require("tests/constants/Wallets");
const createAuctionHouseHelper_1 = __importDefault(require("tests/utils/createAuctionHouseHelper"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
exports.DEBUG = process.env.DEBUG === "true";
exports.IS_NATIVE = process.env.SPL_TOKEN == null;
exports.LOG_TX_SIZE = process.env.LOG_TX_SIZE == "true";
const UNIT_TESTS = process.env.UNIT_TESTS == "true";
// This file should have been created up front before the tests run, when the
// ALT was created. Note that if running unit tests this file will not exist,
// so this will default to the PublicKey default value.
exports.ADDRESS_LOOKUP_TABLE_ADDRESS = UNIT_TESTS
    ? web3_js_1.PublicKey.default
    : (0, readAddressLookupTableFromDisk_1.default)(process.env.ADDRESS_LOOKUP_TABLE_FILE);
// Regular test mode suppresses all console.error output, which is noisy.
const spy = jest.spyOn(console, "error");
const connection = (0, getConnectionForTest_1.default)();
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // We want to skip setup if we are just running unit tests.
    if (UNIT_TESTS) {
        return;
    }
    if (!exports.DEBUG) {
        spy.mockImplementation(() => null);
    }
    if (exports.DEBUG) {
        global.Promise = require("bluebird");
        console.log("Running tests in DEBUG mode, tests will run serially and console.error and logIfDebug " +
            "output will be displayed. Lastly, Bluebird's Promise implementation will be used " +
            "to enable more informative stack traces");
    }
    else {
        console.log("Running tests in regular mode. Run yarn test-debug to see console.error and logIfDebug output.");
    }
    yield (0, formfunction_program_shared_1.requestAirdrops)({
        connection,
        wallets: [Wallets_1.WALLET_CREATOR, Wallets_1.WALLET_SPL_TOKEN_MINT_AUTHORITY],
    });
    const programCreator = (0, getProgram_1.default)(Wallets_1.WALLET_CREATOR);
    // By default, all formfn-auction-house-* tests will use the
    // same auction house. Thus, we create it before all tests run
    // to ensure that there aren't any weird race conditions if these
    // tests run in parallel. Some tests override this and create another
    // auction house to be used for that test.
    // We need to create the SOL auction house for SPL token tests since
    // we use the SOL auction house for last_bid_price and thus it is assumed
    // to be created.
    if (!exports.IS_NATIVE) {
        yield (0, createAuctionHouseHelper_1.default)(connection, programCreator, Wallets_1.WALLET_CREATOR, true);
    }
    // Create the actual auction house.
    yield (0, createAuctionHouseHelper_1.default)(connection, programCreator, Wallets_1.WALLET_CREATOR);
}));
afterAll(() => {
    if (!exports.DEBUG) {
        spy.mockRestore();
    }
});
//# sourceMappingURL=setup.js.map