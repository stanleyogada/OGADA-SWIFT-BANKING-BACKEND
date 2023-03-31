export type TUser = {
  id: number;
  created_at: Date;
  updated_at: Date;
  first_name: string;
  last_name: string;
  middle_name?: string;
  nickname?: string;
  phone: string;
  email: string;
  email_is_verified?: boolean;
  login_passcode: string;
};
