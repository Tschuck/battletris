import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'
import User from './User';

@Entity('Match')
export default class Match extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => User, (user) => user.matches)
  users?: User[];
}
