import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Dayjs } from "dayjs";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    feeAccount: PublicKey;
    previousBidderRefundAccount: PublicKey;
    previousBidderWallet: PublicKey;
    priceInLamports: number;
    program: AuctionHouseProgram;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    treasuryMint: PublicKey;
    walletBuyer: PublicKey;
};
type Args = {
    auctionEndTime?: Dayjs;
    tokenSize?: number;
};
export default function auctionHouseBuyV2Ix({ program, walletBuyer, tokenAccount, tokenMint, priceInLamports, treasuryMint, authority, auctionHouse, auctionHouseProgramId, feeAccount, previousBidderRefundAccount, previousBidderWallet, }: Accounts, { auctionEndTime, tokenSize }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseBuyV2Ix.d.ts.map