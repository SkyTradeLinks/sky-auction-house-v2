import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    feeAccount: PublicKey;
    paymentAccount: PublicKey;
    program: AuctionHouseProgram;
    tokenMint: PublicKey;
    transferAuthority: PublicKey;
    treasuryMint: PublicKey;
    wallet: PublicKey;
};
type Args = {
    amount: number;
};
export default function auctionHouseDepositIx({ program, wallet, feeAccount, paymentAccount, transferAuthority, tokenMint, authority, auctionHouse, treasuryMint, auctionHouseProgramId, }: Accounts, { amount }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseDepositIx.d.ts.map