import { KeysInterface } from '@battletris/shared/functions/keymaps/KeyMapInterface';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './User';

@Entity('KeyMap')
export default class UserKeyMap extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 33 })
  arr: number;

  @Column({ type: 'int', default: 167 })
  das: number;

  @Column({ type: 'int', default: 0 })
  dcd: number;

  @Column({ type: 'int', default: 40 })
  sdf: number;

  @Column({ type: 'int', default: 30 })
  rts: number;

  @Column({ type: 'simple-json' })
  keys: KeysInterface;

  @ManyToOne(() => User, user => user.keyMaps)
  user?: User;
}
