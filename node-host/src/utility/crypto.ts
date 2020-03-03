import * as hmac from 'crypto-js/hmac-sha1'
import * as aes from 'crypto-js/aes';
import * as utf8 from 'crypto-js/enc-utf8'

const secret = 'jacky.li';

export default {
  sha(str: string){
    return hmac(str, secret).toString()
  },
  encrypt(str: string){
    return aes.encrypt(aes.encrypt(str, secret).toString(), secret).toString()
  },
  decrypt(str: string){
    return aes.decrypt(aes.decrypt(str, secret).toString(utf8), secret).toString(utf8)
  }
}