import { FindUsersOutput } from '../dto/find-users.input';
import { User } from '../entities/user.entity';

export const returningUser = () => User;

export const returningUsers = () => [User];

export const returningFindUsersOutput = () => FindUsersOutput;
