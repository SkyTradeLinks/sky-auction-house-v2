"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
function getTestMetadata(...creators) {
    return {
        collection: null,
        creators: creators.map((creator) => ({
            address: creator.address,
            share: creator.share,
            verified: creator.verified,
        })),
        name: "test",
        sellerFeeBasisPoints: AuctionHouse_1.BASIS_POINTS,
        symbol: "test",
        uri: "test",
        uses: null,
    };
}
exports.default = getTestMetadata;
//# sourceMappingURL=getTestMetadata.js.map