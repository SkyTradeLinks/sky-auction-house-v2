use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{constants::*, state::*, utils::*, AuctionHouse, AuctionHouseError};

// Accepts additional accounts compared to Cancel to support
// mpl_token_metadata::instruction::thaw_delegated_account call
#[derive(Accounts)]
#[instruction(trade_state_bump: u8, leaf_data: LeafData)]
pub struct CancelV2<'info> {
    /// CHECK: No need to deserialize.
    #[account(mut)]
    wallet: UncheckedAccount<'info>,

    treasury_mint: Box<Account<'info, Mint>>,

    /// CHECK: No need to deserialize.
    asset_id: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    authority: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    merkle_tree: UncheckedAccount<'info>,

    #[account(
        has_one = authority,
        has_one = auction_house_fee_account,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.creator.as_ref(),
            auction_house.treasury_mint.as_ref()
        ],
        bump = auction_house.bump,
    )]
    auction_house: Account<'info, AuctionHouse>,

    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.key().as_ref(),
            FEE_PAYER.as_bytes()
        ],
        bump = auction_house.fee_payer_bump
    )]
    auction_house_fee_account: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            wallet.key().as_ref(),
            auction_house.key().as_ref(),
            asset_id.key().as_ref(),
            auction_house.treasury_mint.as_ref(),
            merkle_tree.key().as_ref(),
        ],
        bump = trade_state_bump
    )]
    trade_state: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    leaf_data_owner: UncheckedAccount<'info>,
}

pub fn handle_cancel_v2(
    ctx: Context<CancelV2>,
    _trade_state_bump: u8,
    leaf_data: LeafData,
) -> Result<()> {
    let wallet = &ctx.accounts.wallet;

    let authority = &ctx.accounts.authority;

    let trade_state = &ctx.accounts.trade_state;

    let auction_house = &ctx.accounts.auction_house;
    let auction_house_fee_account = &ctx.accounts.auction_house_fee_account;

    let treasury_mint = &ctx.accounts.treasury_mint;

    let merkle_tree = &ctx.accounts.merkle_tree;

    let leaf_owner = &ctx.accounts.leaf_data_owner;

    let asset_id = &ctx.accounts.asset_id;

    assert_valid_auction_house(ctx.program_id, &auction_house.key())?;

    assert_keys_equal(treasury_mint.key(), auction_house.treasury_mint)?;

    assert_keys_equal(leaf_owner.key(), wallet.key())?;

    assert_valid_nft_owner(&leaf_data, leaf_owner, merkle_tree, asset_id)?;

    let auction_house_key = auction_house.key();

    let seeds = [
        PREFIX.as_bytes(),
        auction_house_key.as_ref(),
        FEE_PAYER.as_bytes(),
        &[auction_house.fee_payer_bump],
    ];

    let (fee_payer, _) = get_fee_payer(
        authority,
        auction_house,
        wallet.to_account_info(),
        auction_house_fee_account.to_account_info(),
        &seeds,
    )?;

    // delete pda

    let curr_lamp = trade_state.lamports();
    **trade_state.lamports.borrow_mut() = 0;

    **fee_payer.lamports.borrow_mut() = fee_payer
        .lamports()
        .checked_add(curr_lamp)
        .ok_or(AuctionHouseError::NumericalOverflow)?;

    Ok(())
}
