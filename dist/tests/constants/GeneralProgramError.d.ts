/**
 * These represent errors thrown from other programs (not our own) which we
 * still want to match against for test assertions.
 *
 * If needed these could be moved to formfn-program-shared.
 */
export declare const SIGNATURE_VERIFICATION_FAILED = "SignatureVerificationFailed";
export declare const CONSTRAINT_SEEDS = "ConstraintSeeds";
export declare const CONSTRAINT_HAS_ONE = "ConstraintHasOne";
export declare const MISSING_ACCOUNT = "MissingAccount";
export declare const ACCOUNT_IS_FROZEN = "Account is frozen";
export declare const EDITION_NUMBER_GREATER_THAN_MAX_SUPPLY = "Edition Number greater than max supply";
type GeneralProgramError = typeof SIGNATURE_VERIFICATION_FAILED | typeof CONSTRAINT_SEEDS | typeof CONSTRAINT_HAS_ONE | typeof MISSING_ACCOUNT | typeof ACCOUNT_IS_FROZEN | typeof EDITION_NUMBER_GREATER_THAN_MAX_SUPPLY;
export default GeneralProgramError;
//# sourceMappingURL=GeneralProgramError.d.ts.map