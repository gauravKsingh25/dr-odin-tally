import { APICore } from "../../helpers/api/apiCore"
import * as URL from "../../constants/endPoint"

const api = new APICore()

function uploadTellyReportApi (params:any):any{
    return api.create(URL.TELLY_REPORT_UPLOAD,params)
}
function uploadSecondTellyReportApi(params:any):any{ 
    
    return api.create(URL.SECOND_TELLY_FILE_UPLOAD,params)

}
function uploadSalaryReportApi(params:any):any{
    return api.create(URL.UPLOAD_SALARY_REPORT,params)
}
function uploadRateDifferenceReportApi(params:any):any{
    return api.create(URL.UPLOAD_RATE_DIFFERENCE_REPORT,params)
}

export {uploadTellyReportApi,uploadSecondTellyReportApi,uploadSalaryReportApi,uploadRateDifferenceReportApi}