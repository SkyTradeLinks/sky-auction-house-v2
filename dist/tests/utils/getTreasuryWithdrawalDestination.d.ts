import { PublicKey } from "@solana/web3.js";
export default function getTreasuryWithdrawalDestination(wallet?: PublicKey, isNativeOverride?: boolean): Promise<{
    treasuryWithdrawalDestination: PublicKey;
    treasuryWithdrawalDestinationOwner: PublicKey;
}>;
//# sourceMappingURL=getTreasuryWithdrawalDestination.d.ts.map