import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import DecodedAuctionHouseTransactionResult from "types/DecodedAuctionHouseTransactionResult";
export default function decodeAuctionHouseTransaction(programId: PublicKey, parsedTransaction: ParsedTransactionWithMeta): Maybe<DecodedAuctionHouseTransactionResult>;
//# sourceMappingURL=decodeAuctionHouseTransaction.d.ts.map