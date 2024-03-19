import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    feeAccount: PublicKey;
    priceInLamports: number;
    program: AuctionHouseProgram;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    treasuryMint: PublicKey;
    wallet: PublicKey;
};
type Args = {
    tokenSize?: number;
};
export default function auctionHouseCancelV2Ix({ program, wallet, feeAccount, tokenAccount, tokenMint, priceInLamports, authority, auctionHouse, treasuryMint, auctionHouseProgramId, }: Accounts, { tokenSize }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCancelV2Ix.d.ts.map