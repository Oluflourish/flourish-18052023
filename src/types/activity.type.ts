export default interface IActivity {
    id: number;
    contract_address: string;
    token_index: number;
    listing_price: number;
    maker: string;
    listing_from: number;
    listing_to: number;
    event_timestamp: Date;
}
