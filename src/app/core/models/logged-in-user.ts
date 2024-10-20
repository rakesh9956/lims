export class LoggedInUser {
    UserId = '';
    UserGuid = '';
    Email: string = '';
    FullName:string='';
    DEFAULTROLES: string = '';
    WebToken: string = '';
    RefreshToken: string = '';
    UpdatedDt:any='';
    UserTypeId:any; 
    MobileNumber:any='';
    CountryCode:any='';
    GRNROLES:any='';
    POROLES:any='';
    PIROLES:any='';
    FirstName:any='';
    DEFAULTCENTER:any='';
    PhoneNumber:any;
    QOROLES:any='';
    SIROLES:any='';
    LOCATIONS:any;
    LOCATIONSGUID:any;
    USERLOCATIONSGUID:any;
    STORE:any;
    SCRAPROLES:any;
    B2BTYPE:any;
    ITEMGUIDS:any;
    ITEMNAMES:any;
    SRFROLES:any;
    SUPPLIERROLES:any;
    MANUFACTUREROLES:any;
    paymentRoles:any
    constructor({ UserId = '', UserGuid = '', webToken = '',refreshToken = '', DEFAULTROLES = '', Email = '',UpdatedDt='' ,UserTypeId='',MobileNumber='',CountryCode='',GRNROLES='',POROLES='',PIROLES='',FirstName='',PhoneNumber='',
    DEFAULTCENTER='',QOROLES='',SIROLES='',LOCATIONS='',LOCATIONSGUID='',USERLOCATIONSGUID='',STORE='',SCRAPROLES='',B2BTYPE='',ITEMGUIDS='',ITEMNAMES='',SRFROLES='',SUPPLIERROLES='',MANUFACTUREROLES='',paymentRoles=''}) {
        this.UserId = (UserId || '').length > 0 ? UserId : this.UserId;
        this.UserGuid = (UserGuid || '').length > 0 ? UserGuid : this.UserGuid;
        this.Email = (Email || '').length > 0 ? Email : this.Email;
        this.MobileNumber = MobileNumber;
        this.CountryCode = CountryCode;
        this.WebToken = webToken;
        this.RefreshToken = refreshToken;
        this.DEFAULTROLES = DEFAULTROLES || '';
        this.UpdatedDt = UpdatedDt;
        this.UserTypeId=UserTypeId;
        this.GRNROLES = GRNROLES;
        this.POROLES= POROLES;
        this.PIROLES=PIROLES;
        this.FirstName=FirstName;
        this.PhoneNumber=PhoneNumber;
        this.DEFAULTCENTER=DEFAULTCENTER
        this.QOROLES=QOROLES
        this.SIROLES=SIROLES
        this.LOCATIONS=LOCATIONS
        this.LOCATIONSGUID=LOCATIONSGUID
        this.USERLOCATIONSGUID=USERLOCATIONSGUID
        this.STORE=STORE
        this.SCRAPROLES=SCRAPROLES,
        this.B2BTYPE=B2BTYPE,
        this.ITEMNAMES=ITEMNAMES,
        this.ITEMGUIDS=ITEMGUIDS,
        this.SRFROLES=SRFROLES,
        this.SUPPLIERROLES=SUPPLIERROLES,
        this.MANUFACTUREROLES=MANUFACTUREROLES,
        this.paymentRoles=paymentRoles
    }
}
