import { BaseEntity, Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Match from './Match';
import UserKeyMap from './UserKeyMap';

@Entity('User')
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'unknown' })
  className: string;

  @Column({ default: 'default', nullable: true })
  activeKeyMap: string;

  @ManyToMany(() => Match, match => match.users)
  @JoinTable({ name: 'user_matches' })
  matches?: Match[];

  @OneToMany(() => UserKeyMap, keyMap => keyMap.user)
  keyMaps?: UserKeyMap[];
}
