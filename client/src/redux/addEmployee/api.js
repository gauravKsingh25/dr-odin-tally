import { APICore } from "../../helpers/api/apiCore";
import * as URL from "../../constants/endPoint"

const api = new APICore()

export function GetDesignation(data) {
    // const search = data?.payload?.search ? data?.payload?.search : '';
    // return api.get(`${URL.LIST_DESIGNATION}search=${search}`)
    return api.get(`${URL.LIST_DESIGNATION}search=${data.search ? data.search : ''}`)

}



export function GetZoneList() {
    return api.get(URL.GET_ZONES)
}
