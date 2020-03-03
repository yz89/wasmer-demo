import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as timeout from 'connect-timeout'
import * as session from 'express-session'
import * as cors from 'cors'
import * as fileUpload from 'express-fileupload'
import * as compression from 'compression'
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';

import router, {middleware} from './router';

import './config';


(async ()=>{
    const app = express();
    const prefix = '/api';

    app.set('trust proxy', true)
    app.use(cors())
    app.use(cookieParser())
    app.use(compression())
    app.options('*', cors())

    // TODO: seems resetTimeout in Base isn't working, this is the temp workaround
    const TIMEOUT = '600s'
    app.use(timeout(TIMEOUT))



    app.use(helmet())
    const bodyParserOptions = {
        strict: false,
        limit: '2mb'
    }
    app.use(bodyParser.json(bodyParserOptions))
    app.use(bodyParser.urlencoded({extended: false}))


    // init router
    app.use(middleware)
    app.use(fileUpload())


    app.use(prefix, router)

    const port = process.env.SERVER_PORT
    app.listen(port, () => {
        console.log(`start server at port ${port}`)
    })

})()