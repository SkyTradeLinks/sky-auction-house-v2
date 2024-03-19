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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const findAuctionHouseFeeAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseFeeAccount"));
const findAuctionHouseTreasuryAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseTreasuryAccount"));
const findEditionAllowlistSettingsAccount_1 = __importDefault(require("solana/pdas/findEditionAllowlistSettingsAccount"));
const findEditionBuyerInfoAccountPda_1 = __importDefault(require("solana/pdas/findEditionBuyerInfoAccountPda"));
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
const getWalletIfNativeElseAta_1 = __importDefault(require("solana/utils/getWalletIfNativeElseAta"));
function getIxMerkleAllowlistProofData(buyerWithAllowlistProofData) {
    if (buyerWithAllowlistProofData == null) {
        return null;
    }
    const { amount, serializedProof, merkleTreeIndex } = buyerWithAllowlistProofData;
    return {
        amount,
        proof: (0, formfunction_program_shared_1.deserializeMerkleProof)(serializedProof).map((val) => [...val]),
        rootIndexForProof: merkleTreeIndex,
    };
}
function auctionHouseBuyEditionV2Ix({ antiBotAuthority, auctionHouse, authority, buyer, mint, newMint, program, treasuryMint, }, { buyerWithAllowlistProofData, priceInLamports }, 
// Creators
remainingAccounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { programId } = program;
        const masterEditionSupply = yield (0, formfunction_program_shared_1.getMasterEditionSupply)(program.provider.connection, mint);
        // This may not be the edition that is actually minted!
        // But we need this to calculate findEditionMarker
        const edition = masterEditionSupply + 1;
        const [editionDistributor] = (0, findEditionDistributor_1.default)(mint, programId);
        const [masterEdition, masterEditionBump] = (0, formfunction_program_shared_1.findEditionPda)(mint);
        const [masterEditionMetadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(mint);
        const [limitedEdition] = (0, formfunction_program_shared_1.findEditionPda)(newMint);
        const [limitedEditionMetadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(newMint);
        const [editionMarker] = (0, formfunction_program_shared_1.findEditionMarkerPda)(mint, new bn_js_1.BN(edition));
        const [treasuryAccount] = (0, findAuctionHouseTreasuryAccount_1.default)(auctionHouse, programId);
        const [distributorTokenAccount] = (0, formfunction_program_shared_1.findAtaPda)(editionDistributor, mint);
        const [buyerTokenAccount] = (0, formfunction_program_shared_1.findAtaPda)(buyer, newMint);
        const [feeAccount] = (0, findAuctionHouseFeeAccount_1.default)(auctionHouse, programId);
        const [editionBuyerInfoAccount, editionBuyerInfoAccountBump] = (0, findEditionBuyerInfoAccountPda_1.default)(mint, buyer, programId);
        const [editionAllowlistSettings] = (0, findEditionAllowlistSettingsAccount_1.default)(editionDistributor, programId);
        const editionDistributorAccountInfo = yield program.account.editionDistributor.fetch(editionDistributor, "confirmed");
        const owner = editionDistributorAccountInfo.owner;
        const ix = yield program.methods
            .buyEditionV2(masterEditionBump, new bn_js_1.BN(edition), new bn_js_1.BN(priceInLamports), editionBuyerInfoAccountBump, getIxMerkleAllowlistProofData(buyerWithAllowlistProofData))
            .accounts({
            antiBotAuthority,
            ataProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            auctionHouseTreasury: treasuryAccount,
            authority,
            buyer,
            buyerPaymentTokenAccount: yield (0, getWalletIfNativeElseAta_1.default)(buyer, treasuryMint),
            buyerTokenAccount,
            editionAllowlistSettings,
            editionBuyerInfoAccount,
            editionDistributor,
            editionMarkerPda: editionMarker,
            limitedEditionMetadata,
            limitedEditionMint: newMint,
            limitedEditionPda: limitedEdition,
            masterEditionMetadata,
            masterEditionPda: masterEdition,
            masterEditionTokenAccount: distributorTokenAccount,
            mint,
            owner,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            sellerPaymentReceiptTokenAccount: yield (0, getWalletIfNativeElseAta_1.default)(owner, treasuryMint),
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenMetadataProgram: formfunction_program_shared_1.TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            treasuryMint,
        })
            .remainingAccounts(remainingAccounts)
            .instruction();
        // If anti-bot measures are enabled, we want to change the antiBotAuthority
        // account such that it is expected to be a signer.
        ix.keys = ix.keys.map((key) => {
            if (editionDistributorAccountInfo.antiBotProtectionEnabled &&
                (0, formfunction_program_shared_1.arePublicKeysEqual)(key.pubkey, antiBotAuthority)) {
                return Object.assign(Object.assign({}, key), { isSigner: true });
            }
            return key;
        });
        return ix;
    });
}
exports.default = auctionHouseBuyEditionV2Ix;
