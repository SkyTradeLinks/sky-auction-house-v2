use anchor_lang::prelude::*;

#[derive(Debug, Clone, AnchorDeserialize, AnchorSerialize)]
pub struct LeafData {
    pub leaf_index: u32,
    pub leaf_nonce: u64,
    pub owner: Pubkey,
    pub delegate: Pubkey,
    pub root: Pubkey,
    pub leaf_hash: Option<[u8; 32]>,
    pub leaf_metadata: Vec<u8>
}