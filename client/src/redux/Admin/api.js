import { APICore } from "../../helpers/api/apiCore"
import * as URL from "../../constants/endPoint"

const api = new APICore()
function createCompanyApi(params:any):any{
    return api.create(URL.CREATE_COMPANY,params)
}
function getCompanyListApi(params:any):any{
    return api.get(`${URL.COMPANY_LIST}${params}`)
}
function companyStatusApi(data):any{
    return api.create(URL.COMPANY_STATUS,data)
}
export {createCompanyApi,getCompanyListApi,companyStatusApi}