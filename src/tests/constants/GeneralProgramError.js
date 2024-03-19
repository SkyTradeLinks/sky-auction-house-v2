"use strict";
/**
 * These represent errors thrown from other programs (not our own) which we
 * still want to match against for test assertions.
 *
 * If needed these could be moved to formfn-program-shared.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDITION_NUMBER_GREATER_THAN_MAX_SUPPLY = exports.ACCOUNT_IS_FROZEN = exports.MISSING_ACCOUNT = exports.CONSTRAINT_HAS_ONE = exports.CONSTRAINT_SEEDS = exports.SIGNATURE_VERIFICATION_FAILED = void 0;
// Solana or Anchor program error codes
exports.SIGNATURE_VERIFICATION_FAILED = "SignatureVerificationFailed";
exports.CONSTRAINT_SEEDS = "ConstraintSeeds";
exports.CONSTRAINT_HAS_ONE = "ConstraintHasOne";
exports.MISSING_ACCOUNT = "MissingAccount";
exports.ACCOUNT_IS_FROZEN = "Account is frozen";
// Metaplex program error codes
exports.EDITION_NUMBER_GREATER_THAN_MAX_SUPPLY = "Edition Number greater than max supply";
