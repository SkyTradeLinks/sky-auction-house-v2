import { ConfirmOptions, Connection, Signer, Transaction } from "@solana/web3.js";
import ProgramTransactionError from "tests/constants/ProgramTransactionError";
/**
 * A wrapper around expectFunctionToFailWithErrorCode which expects a transaction,
 * rather than an arbitrary function, to fail with a specific program error code.
 */
export default function expectTransactionToFailWithErrorCode({ connection, errorName, options, signers, transaction, }: {
    connection: Connection;
    errorName: ProgramTransactionError;
    options?: ConfirmOptions;
    signers: Array<Signer>;
    transaction: Transaction;
}): Promise<void>;
//# sourceMappingURL=expectTransactionToFailWithErrorCode.d.ts.map