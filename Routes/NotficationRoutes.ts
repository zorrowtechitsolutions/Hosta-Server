import express from 'express';
const router = express.Router();
import { getUserUnread , getHospitalUnread, getUserRead, getHospitalRead, updateHospital, updateUser}  from '../Controllers/NotificationSide/NotificationForm';


import { trycatch } from "../Utils/TryCatch";



router.get('/notification/user/no-read/:id', trycatch(getUserUnread));
router.get('/notification/hospital/no-read/:id', trycatch(getHospitalUnread));

router.get('/notification/user/read/:id', trycatch(getUserRead ));
router.get('/notification/hospital/read/:id', trycatch(getHospitalRead ));

router.patch('/notification/user/:id', trycatch(updateUser));
router.patch('/notification/hospital/:id', trycatch(updateHospital));



export default router;
