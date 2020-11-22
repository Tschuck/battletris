import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToMany, Column } from 'typeorm'
import User from './User';

@Entity('Match')
export default class Match extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, (user) => user.matches)
  users?: User[];

  @Column({ type: 'datetime' })
  started: Date;

  @Column({ type: 'datetime' })
  stopped: Date;

  @Column({ type: 'text' })
  stats: string;
}
