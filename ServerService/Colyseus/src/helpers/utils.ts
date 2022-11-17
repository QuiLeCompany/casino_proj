import bcrypt from "bcrypt";

export class Utils {

    public static generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
    }
}