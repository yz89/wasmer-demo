import {Request, Response, NextFunction, Router} from 'express';
import {crypto, _} from '../utility';
// import * as moment from 'moment';
import Base from './Base';

import ping from './ping';





/**
 * Every request intercepts the token and sets the session user from the userId again
 *
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @returns {boolean}
 */
export const middleware = async (req: Request, res: Response, next: NextFunction) => {
  // check token
  const token = req.cookies['token'] || req.headers['token'];

  req['session'] = {} as any;
  if(token){
    // const uid = crypto.decrypt(token);
  

    // if(user){
    //   req['session'].user = user;
    // }
  }
  next();
}

const router = Router();
router.use('/ping', Base.setRouter([{
  path : '/',
  method : 'get',
  router : ping
}]));


router.use((req, res) => {
  return res.sendStatus(403);
})

export default router