import express from "express" ;
import workshop from "../controllers/workshop.js";
import { verifyJWT } from "../middleware/verifyJWT.js";


const workshopRouter = express.Router() ;

workshopRouter.get('/' , workshop.getWorkshops) ;

export default workshopRouter ;
