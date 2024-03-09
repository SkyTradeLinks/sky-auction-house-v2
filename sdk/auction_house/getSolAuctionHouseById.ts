import { PublicKey } from "@solana/web3.js";


export default function getSolAuctionHouseAccountByProgramId(
  programId: PublicKey
): PublicKey {
  const programIdString = programId.toString();
  switch (programIdString) {
    case AuctionHouseProgramId.Mainnet:
      return new PublicKey("u5pLTMPar2nvwyPPVKbJ3thqfv7hPADdn3eR8zo1Q2M");
    case AuctionHouseProgramId.Devnet:
      return new PublicKey("DJ117NHZaXzpKQ5VwHzQBGzJYKwRT6vaxWd2q39gkXxN");
    case AuctionHouseProgramId.Testnet:
      return new PublicKey("BnYmzPQitxZ3Q736LrC25bcvBN8hPLth1q3z4JJxyY7s");
    case AuctionHouseProgramId.Localnet:
      return new PublicKey("8nEg1EYQ24mvy8fkKbS7kje6rsfBKY1cZ8CyWBoL57QA");
    default:
      throw new Error(`Unrecognized program ID ${programIdString}`);
  }
}