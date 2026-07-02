import { UserRole } from "../../../users/domain/enums/user-role.enum";


export class CurrentUserResponse {
  id!: string;
  email!: string;
  role!: UserRole;
}
