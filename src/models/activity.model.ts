import { Model, Table, Column, DataType } from "sequelize-typescript";

@Table({ tableName: "activity" })
export default class Activity extends Model {

  // contract_address => order.contract => Smart contract address for the NFT. It is always the same size and format.
  // token_index => order.criteria.data.token.tokenId => The index of the NFT
  // listing_price => order.price.amount.native => The amount in ETH
  // maker => order.maker => The wallet address of the user that created the listing
  // listing_from => order.validFrom => Timestamp for when the listing started
  // listing_to => order.validTo => The expiry timestamp for the listing
  // event_timestamp => event.createdAt => Timestamp of when the event was sent

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "id"
  })
  id?: number;

  @Column({
    type: DataType.STRING(255),
    field: "contract_address"
  })
  contract_address?: string;

  @Column({
    type: DataType.STRING(255),
    field: "token_index"
  })
  token_index?: number;

  @Column({
    type: DataType.FLOAT,
    field: "listing_price"
  })
  listing_price?: number;

  @Column({
    type: DataType.STRING(255),
    field: "maker"
  })
  maker?: string;

  @Column({
    type: DataType.INTEGER,
    field: "listing_from"
  })
  listing_from?: number;


  @Column({
    type: DataType.INTEGER,
    field: "listing_to"
  })
  listing_to?: number;

  @Column({
    type: DataType.DATE,
    field: "event_timestamp"
  })
  event_timestamp?: Date;

}
