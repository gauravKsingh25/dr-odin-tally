import { APICore } from "../../helpers/api/apiCore"
import * as URL from "../../constants/endPoint"

const api = new APICore()

function getAnnualSaleSummaryApi(data):any{
    
    return api.get(`${URL.ANNUAL_SALE_SUMMARY}${data?.payload}`)
}

function getSalesVsSalaryReportApi(data):any{ 
    return api.get(`${URL.GET_SALES_VS_SALARY}${data?.payload}`)
}
function AnnualTargetSummaryApi(data):any{ 
    return api.get(`${URL.ANNUAL_TARGET_SUMMARY}${data?.payload}`)
}

export  {getAnnualSaleSummaryApi,getSalesVsSalaryReportApi,AnnualTargetSummaryApi}