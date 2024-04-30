import { Router } from 'express';
import { userSignUp, userLogin, donate, findDonors, findBloodBanks } from '../controllers/user.controller.js';

const router = Router();

router.route('/sign-up').post(
    userSignUp
);

router.route('/sign-in').post(
    userLogin
);

router.route('/donate').post(
    donate
);

router.route('/find-donors').post(
    findDonors
);

router.route('/find-blood-banks').post(
    findBloodBanks
);

export default router;

