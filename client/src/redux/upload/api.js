import { APICore } from "../../helpers/api/apiCore"
import * as URL from "../../constants/endPoint"

const api = new APICore()

function uploadTellyReportApi (params){
    return api.create(URL.TELLY_REPORT_UPLOAD,params)
}
function uploadSecondTellyReportApi(params){ 
    
    return api.create(URL.SECOND_TELLY_FILE_UPLOAD,params)

}
function uploadSalaryReportApi(params){
    return api.create(URL.UPLOAD_SALARY_REPORT,params)
}
function uploadRateDifferenceReportApi(params){
    return api.create(URL.UPLOAD_RATE_DIFFERENCE_REPORT,params)
}

// Voucher Excel Upload API
function uploadVoucherExcelApi(params){
    return api.create(URL.UPLOAD_VOUCHER_EXCEL, params)
}

export {uploadTellyReportApi,uploadSecondTellyReportApi,uploadSalaryReportApi,uploadRateDifferenceReportApi, uploadVoucherExcelApi}