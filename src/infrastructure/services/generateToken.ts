import jwt from 'jsonwebtoken';
import JWT from '../../useCase/interface/ljwt';

class JWTToken implements JWT {
    generateToken(userId: string): string {
        
        const SECRETKEY=process.env.JWT_SECRET_KEY;
        if(SECRETKEY){
            const token=jwt.sign({id:userId},SECRETKEY,{
                expiresIn:'30d'
            })
            return token
        }
        throw new Error('JWT key is not defined!')
    }
}

export default JWTToken;