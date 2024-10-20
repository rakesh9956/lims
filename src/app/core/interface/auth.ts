export interface ILogin {
    userName: string;
    password: string;
    clientId:string;
    authType:string;
    verificationCode:string;
    phoneNum:string;
    countryCode:string;
}

export interface ISignup {
    userName: string;
    password: string;
    confirmPassword: string;
    passwordAgain:string;
    email:string;
    CreateDate:any;
    UpdateDate:any;
}
export interface IConfirmPassword {
    userId:string;
    password: string;
    confirmPassword: string;
}
