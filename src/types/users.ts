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
  login_passcode: string;
  one_time_password?: string | null;
};

export type { TUser };
