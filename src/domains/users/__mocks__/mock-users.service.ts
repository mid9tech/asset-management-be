import { CreateUserInput } from '../dto/create-user.input';
import { data } from '../../../shared/__mocks__/user';

export default class UsersServiceMock {
  create = jest.fn().mockImplementation((createUserInput: CreateUserInput) => {
    const { dateOfBirth, joinedDate, lastName, firstName } = createUserInput;

    // Custom validation for name
    if (lastName === '' && firstName === '') {
      return { message: 'Name Not Valid' };
    }

    // Validate dateOfBirth format
    if (isNaN(Date.parse(dateOfBirth))) {
      return { message: 'DOB Not Valid' };
    }

    // Validate joinedDate format
    if (isNaN(Date.parse(joinedDate))) {
      return { message: 'JoinedDate Not Valid' };
    }

    // Convert date strings to Date objects
    const dob = new Date(dateOfBirth);
    const joinDate = new Date(joinedDate);

    // Validation: dateOfBirth > 18 years ago
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
    if (dob > eighteenYearsAgo) {
      return { message: 'Must be at least 18 years old' };
    }

    // Validation: joinedDate > dateOfBirth + 18 years
    const eighteenYearsAfterDOB = new Date(
      dob.getFullYear() + 18,
      dob.getMonth(),
      dob.getDate(),
    );
    if (joinDate < eighteenYearsAfterDOB) {
      return { message: 'JoinedDate must be at least 18 years after DOB' };
    }

    return data[0];
  });
}
