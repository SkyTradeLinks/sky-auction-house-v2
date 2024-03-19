import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { AccountMeta, PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
import MerkleAllowlistBuyerWithProof from "types/merkle-tree/MerkleAllowlistBuyerWithProof";
type Accounts = {
    antiBotAuthority: PublicKey;
    auctionHouse: PublicKey;
    authority: PublicKey;
    buyer: PublicKey;
    mint: PublicKey;
    newMint: PublicKey;
    program: AuctionHouseProgram;
    treasuryMint: PublicKey;
};
type Args = {
    buyerWithAllowlistProofData: Maybe<MerkleAllowlistBuyerWithProof>;
    priceInLamports: number;
};
export default function auctionHouseBuyEditionV2Ix({ antiBotAuthority, auctionHouse, authority, buyer, mint, newMint, program, treasuryMint, }: Accounts, { buyerWithAllowlistProofData, priceInLamports }: Args, remainingAccounts: Array<AccountMeta>): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseBuyEditionV2Ix.d.ts.map