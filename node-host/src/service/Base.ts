import * as _ from 'lodash'

export default class Base {
  public session
  public currentUser

  constructor(session){
    this.session = session || {};
    this.currentUser = session.user || null;

    this.init()
  }

  protected init(){}


  protected getService<T extends Base>(service: { new(...args): T }): T{
    return new service(this.session)
  }
  
}