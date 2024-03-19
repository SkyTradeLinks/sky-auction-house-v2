"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const constructMerkleLeafNode_1 = __importDefault(require("utils/merkle-tree/constructMerkleLeafNode"));
function constructMerkleTree(buyers, masterEditionMint) {
    const leafs = [];
    buyers.forEach((buyer) => {
        leafs.push((0, constructMerkleLeafNode_1.default)(buyer, masterEditionMint));
    });
    return new formfunction_program_shared_1.MerkleTree(leafs);
}
exports.default = constructMerkleTree;
//# sourceMappingURL=constructMerkleTree.js.map