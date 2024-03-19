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
const AppendMerkleRootsLimitPerTx_1 = __importDefault(require("tests/constants/AppendMerkleRootsLimitPerTx"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const constructMerkleEditionAllowlist_1 = __importDefault(require("utils/merkle-tree/constructMerkleEditionAllowlist"));
function createEditionAllowlist({ auctionHouseSdk, buyers, connection, mint, auctionHouseAuthorityKeypair, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const allowlistedBuyers = buyers.map((buyer) => ({
            address: buyer.publicKey,
            amount: (0, formfunction_program_shared_1.randomNumberInRange)(1, 4),
        }));
        const merkleAllowlistInfo = (0, constructMerkleEditionAllowlist_1.default)(mint, allowlistedBuyers);
        const uploadBatches = (0, formfunction_program_shared_1.chunkArray)(merkleAllowlistInfo, AppendMerkleRootsLimitPerTx_1.default);
        yield (0, formfunction_program_shared_1.forEachAsync)(uploadBatches, (batch) => __awaiter(this, void 0, void 0, function* () {
            const merkleRoots = batch.map((val) => val.tree.getRoot());
            const transaction = yield auctionHouseSdk.appendEditionAllowlistMerkleRootsTx({ mint }, { merkleRoots });
            yield (0, sendTransactionWithWallet_1.default)(connection, transaction, auctionHouseAuthorityKeypair);
        }));
        return merkleAllowlistInfo;
    });
}
exports.default = createEditionAllowlist;
