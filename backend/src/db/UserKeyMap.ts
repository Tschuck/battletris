import { KeysInterface } from '@battletris/shared/functions/keymaps/KeyMapInterface';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './User';

@Entity('KeyMap')
export default class UserKeyMap extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'simple-json' })
  keys: KeysInterface;

  @ManyToOne(() => User, user => user.keyMaps)
  user?: User;
}
