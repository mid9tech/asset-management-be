import { LOCATION, USER_TYPE } from '../enums';

export interface CurrentUserInterface {
  id: number;
  firstName: string;
  staffCode: string;
  lastName: string;
  location: LOCATION;
  state: boolean;
  type: USER_TYPE;
  username: string;
  joinedDate: string;
}
