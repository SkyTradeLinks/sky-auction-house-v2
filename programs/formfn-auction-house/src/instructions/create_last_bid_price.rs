use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{constants::*, utils::*, AuctionHouse, LastBidPrice, LAST_BID_PRICE_SIZE};

#[derive(Accounts)]
pub struct CreateLastBidPrice<'info> {
    #[account(mut)]
    wallet: Signer<'info>,

    /// CHECK: No need to deserialize.
    asset_id: UncheckedAccount<'info>,

    #[account(
        seeds = [
            PREFIX.as_bytes(),
            auction_house.creator.as_ref(),
            auction_house.treasury_mint.as_ref()
        ],
        bump = auction_house.bump
    )]
    auction_house: Account<'info, AuctionHouse>,
    #[account(
        init,
        seeds = [
            LAST_BID_PRICE.as_bytes(),
            auction_house.key().as_ref(),
            asset_id.key().as_ref()
        ],
        payer = wallet,
        space = LAST_BID_PRICE_SIZE,
        bump
    )]
    last_bid_price: Account<'info, LastBidPrice>,
    system_program: Program<'info, System>,
}

pub fn handle_create_last_bid_price<'info>(
    ctx: Context<'_, '_, '_, 'info, CreateLastBidPrice<'info>>,
) -> Result<()> {
    let auction_house = &ctx.accounts.auction_house;
    let asset_id = &ctx.accounts.asset_id;
    let last_bid_price = &mut ctx.accounts.last_bid_price;

    assert_valid_auction_house(ctx.program_id, &auction_house.key())?;

    // fix
    // assert_valid_last_bid_price(
    //     &last_bid_price.to_account_info(),
    //     ctx.program_id,
    //     &token_mint.key(),
    // )?;

    last_bid_price.price = 0;
    last_bid_price.bidder = Some(ZERO_PUBKEY);
    last_bid_price.has_been_sold = 0;
    last_bid_price.tick_size_constant_in_lamports = 0;
    last_bid_price.has_campaign_escrow_treasury = false;

    Ok(())
}
