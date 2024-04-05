use crate::{constants::*, state::*, utils::*, AuctionHouse};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

#[derive(Accounts)]
#[instruction(trade_state_bump: u8, buyer_price: u64, sale_type: u8, leaf_data: LeafData)]
pub struct Sell<'info> {
    #[account(mut)]
    wallet: Signer<'info>,

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
    seller_trade_state: UncheckedAccount<'info>,

    treasury_mint: Box<Account<'info, Mint>>,

    system_program: Program<'info, System>,

    rent: Sysvar<'info, Rent>,

    /// CHECK: No need to deserialize.
    leaf_data_owner: UncheckedAccount<'info>,
}

pub fn handle_sell<'info>(
    ctx: Context<'_, '_, '_, 'info, Sell<'info>>,
    trade_state_bump: u8,
    buyer_price: u64,
    sale_type: u8,
    leaf_data: LeafData,
) -> Result<()> {
    let wallet = &ctx.accounts.wallet;

    let authority = &ctx.accounts.authority;
    let seller_trade_state = &ctx.accounts.seller_trade_state;

    let auction_house = &ctx.accounts.auction_house;
    let auction_house_fee_account = &ctx.accounts.auction_house_fee_account;

    let treasury_mint = &ctx.accounts.treasury_mint;

    let system_program = &ctx.accounts.system_program;

    let rent = &ctx.accounts.rent;

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

    let (fee_payer, fee_seeds) = get_fee_payer(
        authority,
        auction_house,
        wallet.to_account_info(),
        auction_house_fee_account.to_account_info(),
        &seeds,
    )?;

    let ts_info = seller_trade_state.to_account_info();
    if ts_info.data_is_empty() {
        let wallet_key = wallet.key();
        let asset_id_key = asset_id.key();

        let ts_seeds = [
            PREFIX.as_bytes(),
            wallet_key.as_ref(),
            auction_house_key.as_ref(),
            asset_id_key.as_ref(),
            auction_house.treasury_mint.as_ref(),
            merkle_tree.key.as_ref(),
            &[trade_state_bump],
        ];
        create_or_allocate_account_raw(
            *ctx.program_id,
            &ts_info,
            &rent.to_account_info(),
            &system_program,
            &fee_payer,
            TRADE_STATE_SIZE,
            fee_seeds,
            &ts_seeds,
        )?;
    }

    let data = &mut ts_info.data.borrow_mut();
    data[0] = trade_state_bump;
    data[1] = sale_type;

    // keep sale price
    data[2..10].copy_from_slice(&buyer_price.to_le_bytes());

    Ok(())
}
