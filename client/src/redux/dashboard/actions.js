import TotalMonthSaleActionTypes from "./constant";

type AuthAction = { type: string, payload: {} | string };

// start active employee list
export const totalMonthSaleAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_TOTALMONTH_SALE,
    payload: data
})
export const totalExpenditureAction = (): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_TOTAL_EXPENDITURE,
    payload: undefined
})
export const monthExpenditureAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_MONTH_EXPENDITURE,
    payload: data
})
export const targetAchievedAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_TARGET_ACHIEVED,
    payload: data
})

export const GET_REPORTING_MANAGER  = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_REPORTING_MANAGER,
    payload: data
})
export const productWiseReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_PRODUCT_WISE_REPORT,
    payload: data
})
export const productWiseCSVReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_PRODUCT_WISE_CSV_REPORT,
    payload: data
})
export const annualSaleGraphAction  = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH,
    payload: data
})

export const getOverAllApi = (data):AuthAction=>({
    type: TotalMonthSaleActionTypes.GET_OVERALL_DATA,
    payload:data
})
export const getSaleExecutiveReportAction = (data):AuthAction=>({
    type: TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT,
    payload:data
})
export const getRevenueByLocationAction = (data):AuthAction=>({
    type: TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION,
    payload:data
})
export const getNorthZoneReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT,
    payload: data
})
export const getSouthZoneReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT,
    payload: data
})
export const getEastZoneReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT,
    payload: data
})
export const getWestZoneReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT,
    payload: data
})
export const getCentralZoneReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT,
    payload: data
})
export const getBdeAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_BDE_LIST,
    payload: data 
})
export const getBdeSouthAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST,
    payload: data
})
export const getBdeEASTAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_BDE_EAST_LIST,
    payload: data
})
export const getBdeWestAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_BDE_WEST_LIST,
    payload: data
})
export const getBdeCenterAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST,
    payload: data
})

export const getFilterProductDataAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA,
    payload: data
})
export const getVenderReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA,
    payload: data
})
export const vendorCSVReportAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_REPORT,
    payload: data
})
export const getProductDetailAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT,
    payload: data
})
export const getVendorDetailAction = (data): AuthAction => ({
    type: TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT,
    payload: data
})