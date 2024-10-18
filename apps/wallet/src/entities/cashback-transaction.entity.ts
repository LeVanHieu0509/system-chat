import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';

@Entity({ name: 'cashback_transaction', synchronize: false })
export class CashbackTransactionEntity extends AbstractEntity {
  @Column({ type: 'numeric' })
  type: number;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'numeric' })
  fee: number;

  @Column({ type: 'numeric' })
  status: number;

  @Column({ type: 'numeric' })
  actionType: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb' })
  vndcJson: any;

  @Column({ type: 'numeric' })
  oldBalance: number;

  @Column()
  accessTradeId: string;

  @Column({ type: 'jsonb' })
  accessTradeJson: any;

  @Column({ type: 'uuid' })
  currencyId: string;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string;

  @Column({ type: 'uuid', nullable: true })
  senderId: string;

  @Column({ type: 'uuid', nullable: true })
  receiverId: string;

  @Column({ type: 'jsonb', name: 'cbHistories', nullable: true })
  cbHistories: any;
}
