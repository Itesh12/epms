import User, { IUser } from '../../models/User';
import { BaseRepository } from '../../core/BaseRepository';

export class EmployeeRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  // Add employee-specific queries if needed later
}
