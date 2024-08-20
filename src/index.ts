import { httpServer } from "./infrastructure/config/app";
import { connectDB } from "./infrastructure/config/connectDB";


const PORT = process.env.PORT || 3000

const startServer = async(): Promise<void> =>{
    
    await connectDB()
    const app = httpServer;

    app.listen(PORT, ()=>{
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
}

startServer();