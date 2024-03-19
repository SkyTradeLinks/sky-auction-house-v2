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
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const findTokenRecordPda_1 = __importDefault(require("tests/utils/programmable-nfts/findTokenRecordPda"));
const getProgrammableNftAssetData_1 = __importDefault(require("tests/utils/programmable-nfts/getProgrammableNftAssetData"));
const getProgrammableNftCreateArgs_1 = __importDefault(require("tests/utils/programmable-nfts/getProgrammableNftCreateArgs"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
function removeNullBytesFromString(str) {
    return str.replace(/\0+/, "");
}
// TODO[@]: Make more configurable as needed.
function createProgrammableNft({ connection, creator, metadataCreators, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const mintKeypair = web3_js_1.Keypair.generate();
        const mint = mintKeypair.publicKey;
        const [metadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(mint);
        const [masterEdition] = (0, formfunction_program_shared_1.findEditionPda)(mint);
        const accounts = {
            authority: creator.publicKey,
            masterEdition,
            metadata,
            mint,
            payer: creator.publicKey,
            splTokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
            sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
            updateAuthority: creator.publicKey,
        };
        const assetData = (0, getProgrammableNftAssetData_1.default)({
            creators: metadataCreators,
        });
        const printSupply = 0;
        const createIx = (0, mpl_token_metadata_1.createCreateInstruction)(accounts, {
            createArgs: (0, getProgrammableNftCreateArgs_1.default)({ assetData, printSupply }),
        });
        // Need to make the mint account a signer. Not sure why it's not. Metaplex also
        // does this in their tests.
        for (let i = 0; i < createIx.keys.length; i++) {
            if (createIx.keys[i].pubkey.toBase58() === mintKeypair.publicKey.toBase58()) {
                createIx.keys[i].isSigner = true;
                createIx.keys[i].isWritable = true;
            }
        }
        const tx = (0, formfunction_program_shared_1.ixToTx)(createIx);
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, creator, [mintKeypair]);
        const metadataAccount = yield mpl_token_metadata_1.Metadata.fromAccountAddress(connection, metadata);
        const [ata] = (0, formfunction_program_shared_1.findAtaPda)(creator.publicKey, mint);
        const [tokenRecord] = (0, findTokenRecordPda_1.default)(mint, ata);
        const mintArgs = {
            mintArgs: {
                __kind: "V1",
                amount: 1,
                authorizationData: null,
            },
        };
        const mintIx = (0, mpl_token_metadata_1.createMintInstruction)({
            authority: creator.publicKey,
            authorizationRules: undefined,
            authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
            masterEdition,
            metadata,
            mint,
            payer: creator.publicKey,
            splAtaProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            splTokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
            token: ata,
            tokenOwner: creator.publicKey,
            tokenRecord,
        }, mintArgs);
        const mintTx = (0, formfunction_program_shared_1.ixToTx)(mintIx);
        yield (0, sendTransactionWithWallet_1.default)(connection, mintTx, creator);
        (0, formfunction_program_shared_1.expectPublicKeysEqual)(metadataAccount.updateAuthority, creator.publicKey);
        (0, formfunction_program_shared_1.expectPublicKeysEqual)(metadataAccount.mint, mint);
        expect(metadataAccount.primarySaleHappened).toBe(assetData.primarySaleHappened);
        expect(metadataAccount.isMutable).toBe(assetData.isMutable);
        expect(metadataAccount.data.sellerFeeBasisPoints).toBe(assetData.sellerFeeBasisPoints);
        expect(removeNullBytesFromString(metadataAccount.data.name)).toEqual(assetData.name);
        expect(removeNullBytesFromString(metadataAccount.data.symbol)).toEqual(assetData.symbol);
        expect(removeNullBytesFromString(metadataAccount.data.uri)).toEqual(assetData.uri);
        return {
            masterEdition,
            metadata,
            metadataAccount,
            mint,
        };
    });
}
exports.default = createProgrammableNft;
//# sourceMappingURL=createProgrammableNft.js.map