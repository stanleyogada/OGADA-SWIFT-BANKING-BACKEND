import bcrypt from "bcrypt";

class HashPassword {
  static handleHash = async (plainPassword: string) => {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  };

  static handleCheck = async (plainPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  };
}

export default HashPassword;
