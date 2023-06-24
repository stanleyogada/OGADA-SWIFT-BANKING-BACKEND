type TUser = {
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
  one_time_password?: string | null;
};

type TAdminUser = {
  id: number;
  created_at: Date;
  updated_at: Date;
  is_admin_user: boolean;
  phone: string;
  login_passcode: string;
};

export type { TUser, TAdminUser };
