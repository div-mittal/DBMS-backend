import { Router } from 'express';
import { adminSignUp, adminLogin, Manage, Update } from '../controllers/admin.controller.js';

const router = Router();

router.route('/sign-up').post(
    adminSignUp
);

router.route('/sign-in').post(
    adminLogin
);

router.route('/manage/:id').get(
    Manage
);

router.route('/update/:id').post(
    Update
);

export default router;