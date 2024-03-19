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
    walletSeller: PublicKey;
};
type Args = {
    tokenSize?: number;
};
export default function auctionHouseSellIx({ program, walletSeller, tokenAccount, feeAccount, tokenMint, priceInLamports, authority, auctionHouse, treasuryMint, auctionHouseProgramId, }: Accounts, { tokenSize }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSellIx.d.ts.map