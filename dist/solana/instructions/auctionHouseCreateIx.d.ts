import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    feeAccount: PublicKey;
    feeWithdrawalDestination: PublicKey;
    payer: PublicKey;
    program: AuctionHouseProgram;
    treasuryAccount: PublicKey;
    treasuryMint: PublicKey;
    treasuryWithdrawalDestination: PublicKey;
    treasuryWithdrawalDestinationOwner: PublicKey;
};
type Args = {
    auctionHouseBump: number;
    basisPoints: number;
    basisPointsSecondary: number;
    canChangePrice: boolean;
    feeBump: number;
    payAllFees: boolean;
    requiresSignOff: boolean;
    treasuryBump: number;
};
export default function auctionHouseCreateIx({ program, authority, auctionHouse, treasuryMint, payer, feeWithdrawalDestination, treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, feeAccount, treasuryAccount, }: Accounts, { auctionHouseBump, feeBump, treasuryBump, basisPoints, requiresSignOff, canChangePrice, basisPointsSecondary, payAllFees, }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCreateIx.d.ts.map