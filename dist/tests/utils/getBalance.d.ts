import { Connection, PublicKey } from "@solana/web3.js";
export default function getBalance(connection: Connection, query: {
    account?: PublicKey;
    wallet?: PublicKey;
}, isNativeOverride?: boolean): Promise<number>;
//# sourceMappingURL=getBalance.d.ts.map