"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const MerkleTreeLeafCountLimit_1 = __importDefault(require("constants/MerkleTreeLeafCountLimit"));
const constructMerkleTree_1 = __importDefault(require("utils/merkle-tree/constructMerkleTree"));
function constructMerkleEditionAllowlist(masterEditionMint, buyers, merkleTreeLeafSizeLimit = MerkleTreeLeafCountLimit_1.default) {
    buyers.sort((0, formfunction_program_shared_1.getCompareByPropertyFunction)("address", (val) => val.toString()));
    return (0, formfunction_program_shared_1.chunkArray)(buyers, merkleTreeLeafSizeLimit).map((chunk, merkleTreeIndex) => {
        const tree = (0, constructMerkleTree_1.default)(chunk, masterEditionMint);
        const buyersChunk = chunk.map((buyer, index) => {
            const proof = tree.getProof(index);
            const { amount, address } = buyer;
            const proofData = {
                address,
                amount,
                merkleTreeIndex,
                serializedProof: (0, formfunction_program_shared_1.serializeMerkleProof)(proof),
            };
            return proofData;
        });
        return { buyersChunk, tree };
    });
}
exports.default = constructMerkleEditionAllowlist;
//# sourceMappingURL=constructMerkleEditionAllowlist.js.map