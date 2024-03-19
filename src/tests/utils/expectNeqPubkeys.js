"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function expectNeqPubkeys(pubkey1, pubkey2) {
    expect(pubkey1 === null || pubkey1 === void 0 ? void 0 : pubkey1.toString()).not.toEqual(pubkey2 === null || pubkey2 === void 0 ? void 0 : pubkey2.toString());
}
exports.default = expectNeqPubkeys;
