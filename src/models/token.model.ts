import { Model, Table, Column, DataType } from "sequelize-typescript";

@Table({ tableName: "token" })
export default class Token extends Model {

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "id"
  })
  id?: number;

  @Column({
    type: DataType.STRING(255),
    field: "token_index"
  })
  index!: number;

  @Column({
    type: DataType.STRING(255),
    field: "contract_address"
  })
  contract_address!: string;

  @Column({
    type: DataType.FLOAT,
    field: "listing_price"
  })
  current_price?: number | null;

  @Column({
    type: DataType.INTEGER,
    field: "listing_to"
  })
  listing_to?: number;
}
