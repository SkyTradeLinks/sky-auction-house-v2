import GeneralProgramError from "tests/constants/GeneralProgramError";
/**
 * Maps a general program error to the specific RegExp pattern to match the error
 * which is thrown in the test. To figure this out for some new future error,
 * run the tests in DEBUG mode and dig through the error logs.
 */
export default function getErrorMatcherForGeneralProgramError(generalProgramError: GeneralProgramError): string;
//# sourceMappingURL=getErrorMatcherForGeneralProgramError.d.ts.map