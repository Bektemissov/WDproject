export interface CurrentUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
  fullName: string;
  email: string;
  phoneNumber: string;
  course: string;
}

export interface Profile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phoneNumber: string;
  course: string;
  role: 'admin' | 'user';
  fullName: string;
}
