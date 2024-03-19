"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
// TODO[@]: Make more configurable as needed.
function getProgrammableNftAssetData({ creators, }) {
    const data = {
        collection: null,
        collectionDetails: null,
        creators,
        isMutable: true,
        name: "ProgrammableNonFungible",
        primarySaleHappened: false,
        ruleSet: null,
        sellerFeeBasisPoints: 0,
        symbol: "PNF",
        tokenStandard: mpl_token_metadata_1.TokenStandard.ProgrammableNonFungible,
        uri: "test-uri",
        uses: null,
    };
    return data;
}
exports.default = getProgrammableNftAssetData;
//# sourceMappingURL=getProgrammableNftAssetData.js.map