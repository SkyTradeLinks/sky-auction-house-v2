"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createKeypairAddressMap(keypairs) {
    return keypairs.reduce((map, keypair) => {
        map[keypair.publicKey.toString()] = keypair;
        return map;
    }, {});
}
exports.default = createKeypairAddressMap;
//# sourceMappingURL=createKeypairAddressMap.js.map