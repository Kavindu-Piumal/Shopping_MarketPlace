import  {Router} from 'express';
import auth from '../middleware/auth.js';
import { addAddresscontroller, deleteAddressController, getAddressController, updateAddressController } from '../controllers/address.controller.js';

const addressRouter = Router();

addressRouter.post('/create',auth,addAddresscontroller);
addressRouter.get('/get',auth,getAddressController)
addressRouter.put('/update',auth,updateAddressController); // Assuming you have an update controller
addressRouter.delete('/disable',auth,deleteAddressController); // Assuming you have a delete controller


export default addressRouter;