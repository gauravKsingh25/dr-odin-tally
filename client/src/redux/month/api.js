import { APICore } from "../../helpers/api/apiCore";
import * as URL from "../../constants/endPoint"

const api = new APICore()

export function getMonth(){
    return api.get(URL.MONTH_API)
}