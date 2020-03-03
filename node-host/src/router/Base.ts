import {Response, Request, Router} from 'express';
import * as Session from 'express-session';
import Service from '../service/Base';
import * as _ from 'lodash';
import * as moment from 'moment';

interface RESULT {
  code: number
  data?: any
  error?: Error
  message?: string
}

interface ROUTEING {
  path: string
  router: any
  method: string
  timeout?: number
}

export default abstract class {
  static setRouter(list: ROUTEING[]): Router{
    const router = Router()
    _.each(list, (item)=>{
      router[item.method](item.path, (req, res)=>{
        const c = new item.router(req, res)
        return c.main()
      })
    })
    return router
  }


  protected req: Request
  protected res: Response
  protected session: Session

  protected needLogin = false

  constructor(req, res) {
    this.req = req
    this.res = res
    this.session = req.session
    this.init()
  }

  protected init(){}

  public async main(): Promise<any> {
    try{
      const f = await this.validate();
      if(!f){
        return this.res.json({code:-401, error:'not login'});
      }

      const result = await this.action()
      if(result){
        this.res.set('Content-Type', 'application/json')
        this.res.json(result)
      }

    }catch(e){
      process.env.NODE_ENV === 'dev' && console.error(e)
      this.res.json(this.result(-1, e))
    }
  }

  private async validate(){
    // check need login or not
    if(this.needLogin){
      if(!this.session.user){
        // this.res.sendStatus(401)
        return Promise.resolve(false);
      }
    }

    return Promise.resolve(true);
  }

  // need to override
  abstract async action()

  protected setCookie(key, value){
    this.res.cookie(key, value, {
      expires : moment().add('d', 7).toDate()
    });
  }


  protected result(code, dataOrError, msg?){
    const opts: RESULT = {
      code,
      data: dataOrError,
      error : dataOrError,
      message : msg
    }
    if(opts.code > 0){
      return {
        code : opts.code,
        data : opts.data,
        message : opts.message || 'ok'
      }
    }
    else{
      const err = opts.error
      return {
        code : err['code'] ? -err['code'] : opts.code,
        type : err.name || '',
        error : err.message || err.toString()
      }
    }

  }

  /*
  * get service
  * */
  protected buildService<T extends Service>(service: { new(...args): T }): T{
    return new service(this.session);
  }

  protected getParam(key?: string): any{
    const param = _.extend({}, this.req.query, this.req.body, this.req.params)
    return key ? _.get(param, key, '') : param
  }

}