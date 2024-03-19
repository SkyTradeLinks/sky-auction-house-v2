"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This is the (arbitrarily estimated) number of merkle roots to send per append
// instruction, and is limited by the transaction size. 20 roots is 640 bytes.
const APPEND_MERKLE_ROOTS_LIMIT_PER_TX = 20;
exports.default = APPEND_MERKLE_ROOTS_LIMIT_PER_TX;
//# sourceMappingURL=AppendMerkleRootsLimitPerTx.js.map