import { environment } from "src/environments/environment";

export let CONFIGURATION = {
    baseUrls: {

       yodaBaseUrl: environment.YodaBaseUrl,
          // yodaBaseUrl:'http://localhost:5264',
        //authBaseUrl:'https://localhost:44358',
        authBaseUrl:environment.AuthBaseUrl
         
    },

}