import { APICore } from "../../../helpers/api/apiCore"
import * as URL from "../../../constants/endPoint"

const api = new APICore()

function getActiveEmployeeApi(data): any {
    return api.get(`${URL.GET_EMPLOYEE}?Askip=${data?.payload?.skip}&Lskip=${data?.payload?.leftSkip}&name=${data?.payload?.searchkey}`)
}

function createActiveEmployeeApi(params: any): any {
    return api.create(URL.CREATE_EMPLOYEE, params)
}
function updateActiveEmployeeApi(params: any): any {
    return api.update(URL.UPDATE_EMPLOYEE, params)
}
function GetReportingManagerByDesignationApi(data): any {
    // return api.get(URL.GET_REPORTING_MANAGER_BY_DESIGNATION,params)
    return api.get(`${URL.GET_REPORTING_MANAGER_BY_DESIGNATION}search=${data.search ? data.search : ''}`)
}

// function updateEmployeeApi(params:any):any{
//     return api.create(URL.CREATE_EMPLOYEE,params)
// }
export { createActiveEmployeeApi, getActiveEmployeeApi, updateActiveEmployeeApi, GetReportingManagerByDesignationApi }
