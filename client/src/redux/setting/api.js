import { APICore } from "../../helpers/api/apiCore"
import * as URL from "../../constants/endPoint"
const api = new APICore()
function createStateApi(params:any):any{
    return api.create(URL.CREATE_STATE,params)
}
function getStateApi(params:any):any{
    return api.get(URL.GET_STATE,params)
}
function deleteStateApi(data):any{
    return api.delete(`${URL.DELETE_STATE}${data}`)
}
function createCity(params:any):any{
    return api.create(URL.ADD_CITY,params)
}

function getCityApi(data):any{
  
    return api.get(`${URL.getCity}?stateId=${data?.id}&skip=${data?.skip}`)
}
function deleteCityApi(data):any{
    return api.delete(`${URL.DELETE_CITY}${data}`)
}
function insertDesignationApis(params:any):any{
    return api.create(URL.CREATE_DESIGNATION,params)
}
function updateStateApi(params:any):any{
    return api.update(URL.UPDATE_STATE,params)
}
function updateDesignationApi(params:any):any{
    return api.update(URL.UPDATE_DESIGNATION,params)
}
function deleteDesignationApi(data):any{
    return api.delete(`${URL.DELETE_DESIGNATION}${data}`)
}
function updateCityApi(params:any):any{
    return api.update(URL.UPDATE_CITY,params)
}
function createProjectionApi(params:any):any{
    return api.create(URL.CREATE_PROJECTION,params)
}
function getProjectionApi(params:any):any{
    return api.get(URL.GET_PROJECTION,params)
}
function updateProjectionApi(params:any):any{
    return api.update(URL.UPDATE_PROJECTION,params)
}

function getcityBystateApi(data):any{
    return api.get(`${URL.GET_CITY_BY_STATE}=${data}`)
}

function getStateByZoneApi(data):any{
    return api.get(`${URL.GET_STATE_BY_ZONE}=${data}`)
}
function createZoneApi(params:any):any{
    return api.create(URL.CREATE_ZONE,params)
}
function getZoneApi(params:any):any{
    return api.get(URL.GET_ZONE,params)
}
function updateZoneApi(params:any):any{
    return api.update(URL.UPDATE_ZONE,params)
}
function deleteZoneApi(data):any{
    return api.delete(`${URL.DELETE_ZONE}${data}`)
}
function getFullMonthsApi(data):any{
    return api.get(`${URL.GET_FULL_MONTHS}`)
}
function addMonthTargetApi(params:any):any{
    return api.create(URL.ADD_MONTHS_TARGET,params)
}
// function updateEmployeeApi(params:any):any{
//    , return api.create(URL.CREATE_EMPLOYEE,params)
// }
export {deleteZoneApi,addMonthTargetApi,createStateApi,deleteStateApi,getFullMonthsApi,updateZoneApi,getcityBystateApi,getZoneApi,getStateByZoneApi,getStateApi,createZoneApi,deleteCityApi,createCity,getCityApi,insertDesignationApis,updateStateApi,updateDesignationApi,createProjectionApi,getProjectionApi,updateCityApi,updateProjectionApi,deleteDesignationApi}
