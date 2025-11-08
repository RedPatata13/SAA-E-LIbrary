import type { User } from "../types";

export default interface IUserRepository{
    getUser (uid: string) : Promise<User>;
    addUser (uid: string, hash: string) : Promise<User>;
    getAllUsers () : Promise<User[]>;
}