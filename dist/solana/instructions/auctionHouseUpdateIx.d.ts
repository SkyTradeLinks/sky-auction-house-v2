import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    feeWithdrawalDestination: PublicKey;
    newAuthority: PublicKey;
    payer: PublicKey;
    program: AuctionHouseProgram;
    treasuryMint: PublicKey;
    treasuryWithdrawalDestination: PublicKey;
    treasuryWithdrawalDestinationOwner: PublicKey;
};
type Args = {
    basisPoints: number;
    basisPointsSecondary: number;
    canChangePrice: boolean;
    payAllFees: boolean;
    requiresSignOff: boolean;
};
export default function auctionHouseUpdateIx({ program, authority, newAuthority, auctionHouse, treasuryMint, payer, feeWithdrawalDestination, treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, }: Accounts, { basisPoints, requiresSignOff, canChangePrice, basisPointsSecondary, payAllFees, }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseUpdateIx.d.ts.map