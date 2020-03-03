import Base from './Base';
import {getProtoPathByName} from '../utility';

import * as caller from 'grpc-caller';


export default class extends Base {

  async action(){

    const rs = await this.test();
    return this.result(1, rs);
  }

  async test(){

    
    const PROTO_PATH = getProtoPathByName('helloworld');
    const client = caller('[::1]:50001', PROTO_PATH, 'Greeter');

    return await client.sayHello({
      name : 'Jacky'
    });

    
  }
}