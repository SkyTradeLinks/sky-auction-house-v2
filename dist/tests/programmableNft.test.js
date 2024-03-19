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
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const createProgrammableNft_1 = __importDefault(require("tests/utils/programmable-nfts/createProgrammableNft"));
describe("Programmable NFTs test", () => {
    test("Create a Programmable NFT", () => __awaiter(void 0, void 0, void 0, function* () {
        const connection = (0, getConnectionForTest_1.default)();
        const creator = web3_js_1.Keypair.generate();
        yield (0, formfunction_program_shared_1.requestAirdrops)({ connection, wallets: [creator] });
        yield (0, createProgrammableNft_1.default)({
            connection,
            creator,
            metadataCreators: [
                { address: creator.publicKey, share: 100, verified: true },
            ],
        });
    }));
});
//# sourceMappingURL=programmableNft.test.js.map