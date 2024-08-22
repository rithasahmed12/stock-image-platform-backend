import User from "../../domain/user";

interface Repo {
    save(user:User): Promise<User>;
    findByEmail(email:string): Promise<User | null>; 
    findByNumber(phone:number): Promise<User | null>; 
}

export default Repo;