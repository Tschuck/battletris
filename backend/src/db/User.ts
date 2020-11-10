import { Classes } from '@battletris/shared';
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Match from './Match';

@Entity('User')
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: Classes.UNKNOWN })
  className: string;

  @ManyToMany(() => Match, match => match.users)
  @JoinTable({ name: 'user_matches' })
  matches?: Match[]
}
