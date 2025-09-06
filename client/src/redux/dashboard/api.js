import { APICore } from "../../helpers/api/apiCore"
import * as URL from "../../constants/endPoint"

const api = new APICore()

function getTotalMonthSaleApi(data):any{
    
    return api.get(`${URL.GET_TOTALMONTH_SALE}?currentMonth=${data?.payload.currentMonth}&startDate=${data?.payload?.startDate}&endDate=${data?.payload?.endDate}&state=${data?.payload?.state}&city=${data?.payload?.city}`)
}

function getTotalExpenditureApi(params:any):any{
    return api.get(URL.GET_TOTAL_EXPENDITURE,params)
}
function getMonthExpenditureApi(data):any{
    return api.get(`${URL.GET_MONTH_EXPENDITURE}?currentMonth=${data?.payload.currentMonth}&startDate=${data?.payload?.startDate}&endDate=${data?.payload?.endDate}&state=${data?.payload?.state}&city=${data?.payload?.city}`)
}
function getTargetAchievedApi(data):any{
    return api.get(`${URL.GET_TARGET_ACHIEVED}?currentMonth=${data?.payload.currentMonth}&startDate=${data?.payload?.startDate}&endDate=${data?.payload?.endDate}&state=${data?.payload?.state}&city=${data?.payload?.city}`)
}
function getProductWiseApi(data):any{
    return api.get(`${URL.GET_PRODUCT_WISE_REPORT}?currentMonth=${data?.payload.currentMonth}&skip=${data?.payload?.skip}&startDate=${data?.payload.startDate}&endDate=${data?.payload?.endDate}&searchkey=${data?.payload?.searchkey}&product=${data?.payload?.product}`)
}
function getfilterProductDataApi(data):any{
    return api.get(`${URL.FILTER_PRODUCT_REPORT}?startDate=${data?.payload.startDate}&endDate=${data?.payload?.endDate}`)
}
function getVendorReportApi(data):any{
    return api.get(`${URL.GET_VENDOR_REPORT}?currentMonth=${data?.payload.currentMonth}&skip=${data?.payload?.skip}&startDate=${data?.payload.startDate}&endDate=${data?.payload?.endDate}&searchkey=${data?.payload?.searchkey}&vendor=${data?.payload?.vendor}`)
}
function getVendorCSVReportApi(data):any{
    return api.get(`${URL.GET_VENDOR_REPORT}?currentMonth=${data?.payload.currentMonth}&skip=${data?.payload?.skip}&startDate=${data?.payload.startDate}&endDate=${data?.payload?.endDate}&searchkey=${data?.payload?.searchkey}&vendor=${data?.payload?.vendor}`)
}
function getAnnualSaleGraphApi(params:any):any{
    return api.get(URL.GET_ANNUAL_SALE_GRAPH) 
}
function getOverAllGraphApi(params:any):any{
    return api.get(URL.OVERALL_API)
}
function getSaleExecutiveReportApi(data):any{
    return api.get(`${URL.GET_SALE_EXECUTIVE_REPORT}?currentMonth=${data?.payload?.currentMonth}&startDate=${data?.payload?.startDate}&endDate=${data?.payload?.endDate}&state=${data?.payload?.state}&city=${data?.payload?.city}`)
}
function getRevenueByLocationApi(data):any{
    return api.get(`${URL.GET_REVENUE_BY_LOCATION}?currentMonth=${data?.payload?.currentMonth}&startDate=${data?.payload?.startDate}&endDate=${data?.payload?.endDate}&state=${data?.payload?.state}&city=${data?.payload?.city}`)
}
function getNorthZoneReportApi(params:any):any{
    return api.get(URL.GET_NORTH_ZONE_REPORT)
}
function getSouthZoneReportApi(params:any):any{
    return api.get(URL.GET_SOUTH_ZONE_REPORT)
}
function getEastZoneReportApi(params:any):any{
    return api.get(URL.GET_EAST_ZONE_REPORT)
}
function getWestZoneReportApi(params:any):any{
    return api.get(URL.GET_WEST_ZONE_REPORT)
}
function getCentalZoneReportApi(params:any):any{
    return api.get(URL.GET_CENTRAL_ZONE_REPORT)
}
function BdeListApi(data):any{
    return api.get(URL.GET_BDE_LIST+data.payload)
}
function getProductDetailReportApi(data):any{
    return api.get(`${URL.GET_PRODUCT_DETAIL_REPORT}${data?.payload}`)
}
function getVendorDetailReportApi(data):any{
    return api.get(`${URL.GET_VENDOR_DETAIL_REPORT}${data?.payload}`)
}
export {getTotalMonthSaleApi,getVendorDetailReportApi,getProductDetailReportApi,getTotalExpenditureApi,getMonthExpenditureApi,getTargetAchievedApi,getProductWiseApi,getAnnualSaleGraphApi,getOverAllGraphApi,getSaleExecutiveReportApi,getRevenueByLocationApi,getNorthZoneReportApi,
    getSouthZoneReportApi,getVendorCSVReportApi,BdeListApi,getEastZoneReportApi,getWestZoneReportApi,getCentalZoneReportApi,getfilterProductDataApi,getVendorReportApi}