import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    program: AuctionHouseProgram;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    walletSeller: PublicKey;
};
export default function auctionHouseThawDelegatedAccountIx({ auctionHouse, auctionHouseProgramId, authority, program, tokenAccount, tokenMint, walletSeller, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseThawDelegatedAccountIx.d.ts.map