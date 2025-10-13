const express = require('express');
const router = express.Router();
const Controller = require('../Controllers/NotificationSide/notification');
import { trycatch } from "../Utils/TryCatch";



router.get('/notification/user/no-read/:id', trycatch(Controller.getUserUnread));
router.get('/notification/hospital/no-read/:id', trycatch(Controller.getHospitalUnread));

router.get('/notification/user/read/:id', trycatch(Controller.getUserRead ));
router.get('/notification/hospital/read/:id', trycatch(Controller.getHospitalRead ));

router.patch('/notification/user/:id', trycatch(Controller.updateUser));
router.patch('/notification/hospital/:id', trycatch(Controller.updateHospital));



export default router;
