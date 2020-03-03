import * as _ from 'lodash';
import crypto from './crypto';
import constant from './constant';
import * as path from 'path';

const getProtoPathByName = (name)=>{
  return path.resolve(process.cwd(), `./proto/${name}.proto`);
}


export {
  getProtoPathByName,
  _,
  crypto,
  constant,
};