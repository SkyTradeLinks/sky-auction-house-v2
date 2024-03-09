import { Maybe } from "../../../formfunction-program-shared/src";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

export default function expectNeqPubkeys(
  pubkey1: Maybe<PublicKey>,
  pubkey2: Maybe<PublicKey>
) {
  expect(pubkey1?.toString()).not.toEqual(pubkey2?.toString());
}
