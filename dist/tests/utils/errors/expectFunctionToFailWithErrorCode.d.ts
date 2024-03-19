import ProgramTransactionError from "tests/constants/ProgramTransactionError";
export default function expectFunctionToFailWithErrorCode({ errorName, fn, }: {
    errorName: ProgramTransactionError;
    fn: (...args: any) => Promise<any>;
}): Promise<void>;
//# sourceMappingURL=expectFunctionToFailWithErrorCode.d.ts.map