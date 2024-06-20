import { MyBadRequestException } from 'src/shared/exceptions';
import { CreateUserInput } from '../dto/create-user.input';
import { userDataMock } from 'src/shared/__mocks__';
import { UpdateUserInput } from '../dto/update-user.input';

export default class UsersServiceMock {
  calculateAge(dob: Date, compareDate: Date): number {
    const diff = compareDate.getTime() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  create = jest.fn().mockImplementation((createUserInput: CreateUserInput) => {
    const { dateOfBirth, joinedDate, lastName, firstName } = createUserInput;

    if (lastName === '' || firstName === '') {
      throw new MyBadRequestException('Name is invalid');
    }

    if (isNaN(Date.parse(dateOfBirth))) {
      throw new MyBadRequestException('DOB is invalid');
    }

    if (isNaN(Date.parse(joinedDate))) {
      throw new MyBadRequestException('JoinedDate is invalid');
    }

    // Validate age at joinedDate
    const dob = new Date(dateOfBirth);
    const joinDate = new Date(joinedDate);
    const currentDate = new Date();

    const ageAtJoinDate = this.calculateAge(dob, joinDate);
    const ageAtCurrentDate = this.calculateAge(dob, currentDate);

    if (ageAtJoinDate < 18) {
      throw new MyBadRequestException(
        'User is under 18 at the join date. Please select a different join date.',
      );
    }

    if (ageAtCurrentDate < 18) {
      throw new MyBadRequestException(
        'User is under 18 currently. Please select a different date of birth.',
      );
    }

    return userDataMock;
  });

  update = jest
    .fn()
    .mockImplementation((id: number, updateUserInput: UpdateUserInput) => {
      const { dateOfBirth, joinedDate } = updateUserInput;

      console.log(id);

      if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
        throw new MyBadRequestException('DOB is invalid');
      }

      if (joinedDate && isNaN(Date.parse(joinedDate))) {
        throw new MyBadRequestException('JoinedDate is invalid');
      }

      // Validate age at joinedDate
      const dob = new Date(dateOfBirth);
      const joinDate = new Date(joinedDate);
      const currentDate = new Date();

      const ageAtJoinDate = this.calculateAge(dob, joinDate);
      const ageAtCurrentDate = this.calculateAge(dob, currentDate);

      if (ageAtJoinDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 at the join date. Please select a different join date.',
        );
      }

      if (ageAtCurrentDate < 18) {
        throw new MyBadRequestException(
          'User is under 18 currently. Please select a different date of birth.',
        );
      }

      return userDataMock;
    });

  disableUser = jest.fn().mockImplementation((id: number) => {
    console.log(id);
    return true;
  });

  updateRefreshToken = jest
    .fn()
    .mockImplementation((id: number, refreshToken: string) => {
      console.log(id, refreshToken);
      return userDataMock;
    });

  checkRefreshToken = jest
    .fn()
    .mockImplementation((id: number, refreshToken: string) => {
      console.log(id, refreshToken);
      return true;
    });

  findOneByUsername = jest.fn().mockImplementation((username: string) => {
    console.log(username);
    return userDataMock;
  });

  updatePassword = jest
    .fn()
    .mockImplementation((id: number, password: string) => {
      console.log(id, password);
      return userDataMock;
    });
}
