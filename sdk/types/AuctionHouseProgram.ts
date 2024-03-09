import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";


type AuctionHouseProgram = Program<AuctionHouse>;

export default AuctionHouseProgram;