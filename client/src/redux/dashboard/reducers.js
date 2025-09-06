import TotalMonthSaleActionTypes from "./constant";

const TOTAL_MONTH_SALE_INITIAL_STATE = {
    totalMonthSale : [],
    loading: false,
};
const TOTAL_EXPENDITURE_INITIAL_STATE = {
    totalexpenditure : [],
    loading: false,
};
const MONTH_EXPENDITURE_INITIAL_STATE = {
    monthexpenditure : [],
    loading: false,
};
const TARGET_ACHIEVED_INITIAL_STATE = {
    targetachieved: [],
    loading: false,
};
const PRODUCT_INITIAL_STATE = {
       productreport: [],
    loading: false,
};
const VENDOR_INITIAL_STATE = {
    vendorreport: [],
 loading: false,
};
const ANNUAL_SALE_GRAPH_INITIAL_STATE = {
    annualsalegraph: [],
 loading: false,
};
const SALE_EXECUTIVE_INITIAL_STATE = {
    salerexecutivereport: [],
 loading: false,
};
const REVENUE_BY_LOCATION_INITIAL_STATE = {
    revenuebylocation: [],
 loading: false,
};
const NORTH_ZONE_INITIAL_STATE = {
    northzonereport: [],
 loading: false,
};
const SOUTH_ZONE_INITIAL_STATE = {
    southzonereport: [],
 loading: false,
};
const EAST_ZONE_INITIAL_STATE = {
    eastzonereport: [],
 loading: false,
};
const WEST_ZONE_INITIAL_STATE = {
    westzonereport: [],
 loading: false,
};
const CENTRAL_ZONE_INITIAL_STATE = {
  centralzonereport: [],
 loading: false,
};
const BDE_LIST_INITIAL_STATE = {
    bdelist: [],
   loading: false,
  };
  const PRODUCT_DETAIL_REPORT_INITIAL_STATE = {
    prductdetail: [],
   loading: false,
  };
  const VENDOR_DETAIL_REPORT_INITIAL_STATE = {
    vendordetail: [],
   loading: false,
  };
export const TotalMonthSaleReducer = (state = TOTAL_MONTH_SALE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes.TOTALMONTH_SALE_LOADING:
            return {
                totalMonthSale:state.totalMonthSale,
                loading: true,
            };
        case TotalMonthSaleActionTypes.TOTALMONTH_SALE_SUCESS:
            return {
                totalMonthSale: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.TOTALMONTH_SALE_ERROR:
            return {
                totalMonthSale:state.totalMonthSale,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const TotalExpenditureReducer = (state = TOTAL_EXPENDITURE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. TOTAL_EXPENDITURE_LOADING:
            return {
                totalexpenditure :state.totalexpenditure ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.TOTAL_EXPENDITURE_SUCESS:
            return {
                totalexpenditure: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.TOTAL_EXPENDITURE_ERROR:
            return {
                totalexpenditure:state.totalexpenditure,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const MonthExpenditureReducer = (state = MONTH_EXPENDITURE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. MONTH_EXPENDITURE_LOADING:
            return {
                monthexpenditure :state.monthexpenditure ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.MONTH_EXPENDITURE_SUCESS:
            return {
                monthexpenditure: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.MONTH_EXPENDITURE_ERROR:
            return {
                monthexpenditure:state.monthexpenditure,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const TargetAchievedReducer = (state = TARGET_ACHIEVED_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. TARGET_ACHIEVED_LOADING:
            return {
                targetachieved :state.targetachieved ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.TARGET_ACHIEVED_SUCESS:
            return {
                targetachieved: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.TARGET_ACHIEVED_ERROR:
            return {
                targetachieved:state.targetachieved,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const ProductReportReducer = (state = PRODUCT_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. PRODUCT_WISE_REPORT_LOADING:
            return {
                productreport :state.productreport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_SUCESS:
            return {
                productreport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_ERROR:
            return {
                productreport:state.productreport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const ProductCSVReportReducer = (state = PRODUCT_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. PRODUCT_WISE_REPORT_CSV_LOADING:
            return {
                productreport :state.productreport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_SUCESS:
            return {
                productreport: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_RESET:
                return PRODUCT_INITIAL_STATE
        case TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_ERROR:
            return {
                productreport:state.productreport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const VendorListReducer = (state = VENDOR_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_VENDOR_REPORT_DATA_LOADING:
            return {
                vendorreport :state.vendorreport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA_SUCCESS:
            return {
                vendorreport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA_ERROR:
            return {
                vendorreport:state.vendorreport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state }; 
    }
};
export const vendorCSVReducer = (state = VENDOR_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_VENDOR_REPORT_CSV_LOADING:
            return {
                vendorreport :state.vendorreport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_SUCESS:
            return {
                vendorreport: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_RESET:
                return VENDOR_INITIAL_STATE
        case TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_ERROR:
            return {
                vendorreport:state.vendorreport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const AnnualSaleGraphReducer = (state = ANNUAL_SALE_GRAPH_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_ANNUAL_SALE_GRAPH_LOADING:
            return {
                annualsalegraph :state.annualsalegraph ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH_SUCESS:
            return {
                annualsalegraph: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH_ERROR:
            return {
                annualsalegraph:state.annualsalegraph,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const OverallDataReducer = (state = ANNUAL_SALE_GRAPH_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_OVERALL_DATA_LOADING:
            return {
                annualsalegraph :state.annualsalegraph ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_OVERALL_DATA_SUCCESS:
            return {
                annualsalegraph: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_OVERALL_DATA_ERROR:
            return {
                annualsalegraph:state.annualsalegraph,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const SaleExecutiveReportReducer = (state = SALE_EXECUTIVE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_SALE_EXECUTIVE_REPORT_LOADING:
            return {
                salerexecutivereport :state.salerexecutivereport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT_SUCCESS:
            return {
                salerexecutivereport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT_ERROR:
            return {
                salerexecutivereport:state.salerexecutivereport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const RevenueByLocationtReducer = (state = REVENUE_BY_LOCATION_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_REVENUE_BY_LOCATION_LOADING:
            return {
                revenuebylocation :state.revenuebylocation ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION_SUCCESS:
            return {
                revenuebylocation: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION_ERROR:
            return {
                revenuebylocation:state.revenuebylocation,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const NorthZoneReportReducer = (state = NORTH_ZONE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_NORTH_ZONE_REPORT_LOADING:
            return {
                northzonereport :state.northzonereport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT_SUCCESS:
            return {
                northzonereport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT_ERROR:
            return {
                northzonereport:state.northzonereport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const SouthZoneReportReducer = (state = SOUTH_ZONE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_SOUTH_ZONE_REPORT_LOADING:
            return {
                southzonereport :state.southzonereport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT_SUCCESS:
            return {
                southzonereport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT_ERROR:
            return {
                southzonereport:state.southzonereport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const EastZoneReportReducer = (state = EAST_ZONE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_EAST_ZONE_REPORT_LOADING:
            return {
                eastzonereport :state.eastzonereport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT_SUCCESS:
            return {
                eastzonereport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT_ERROR:
            return {
                eastzonereport:state.eastzonereport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const WestZoneReportReducer = (state = WEST_ZONE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_WEST_ZONE_REPORT_LOADING:
            return {
                westzonereport :state.westzonereport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT_SUCCESS:
            return {
                westzonereport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT_ERROR:
            return {
                westzonereport:state.westzonereport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const CentralZoneReportReducer = (state = CENTRAL_ZONE_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_CENTRAL_ZONE_REPORT_LOADING:
            return {
                centralzonereport :state.centralzonereport ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT_SUCCESS:
            return {
                centralzonereport: action?.payload,
                loading: false,
            };
        
        case TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT_ERROR:
            return {
                centralzonereport:state.centralzonereport,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const BdeListReducer = (state = BDE_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_BDE_LIST_LOADING:
            return {
                bdelist :state.bdelist ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_BDE_LIST_SUCCESS:
            return {
                bdelist: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_BDE_LIST_RESET:
            return {
                bdelist: [],
                loading: true,
            };
        
        case TotalMonthSaleActionTypes.GET_BDE_LIST_ERROR:
            return {
                bdelist:state.bdelist,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const BdeSouthListReducer = (state = BDE_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_BDE_SOUTH_LIST_LOADING:
            return {
                bdelist :state.bdelist ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_SUCCESS:
            return {
                bdelist: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_RESET:
                return {
                    bdelist: [],
                    loading: true,
                };
        case TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_ERROR:
            return {
                bdelist:state.bdelist,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const BdeEastListReducer = (state = BDE_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_BDE_EAST_LIST_LOADING:
            return {
                bdelist :state.bdelist ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_SUCCESS:
            return {
                bdelist: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_RESET:
                return {
                    bdelist: [],
                    loading: true,
                };
        
        case TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_ERROR:
            return {
                bdelist:state.bdelist,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const BdeWestListReducer = (state = BDE_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_BDE_WEST_LIST_LOADING:
            return {
                bdelist :state.bdelist ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_SUCCESS:
            return {
                bdelist: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_RESET:
                return {
                    bdelist: [],
                    loading: true,
                };
        
        case TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_ERROR:
            return {
                bdelist:state.bdelist,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const BdeCenterListReducer = (state = BDE_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes. GET_BDE_CENTER_LIST_LOADING:
            return {
                bdelist :state.bdelist ,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_SUCCESS:
            return {
                bdelist: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_RESET:
                return {
                    bdelist: [],
                    loading: true,
                };
        case TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_ERROR:
            return {
                bdelist:state.bdelist,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const productDetailReportReducer = (state = PRODUCT_DETAIL_REPORT_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_LOADING:
            return {
                prductdetail:state.prductdetail,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_SUCCESS:
            return {
                prductdetail: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_RESET:
                return PRODUCT_DETAIL_REPORT_INITIAL_STATE
        case TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_ERROR:
            return {
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const VendorDetailReportReducer = (state = VENDOR_DETAIL_REPORT_INITIAL_STATE, action) => {
    switch (action.type) {
        case TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_LOADING:
            return {
                vendordetail:state.vendordetail,
                loading: true,
            };
        case TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_SUCCESS:
            return {
                vendordetail: action?.payload,
                loading: false,
            };
            case TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_RESET:
                return VENDOR_DETAIL_REPORT_INITIAL_STATE
        case TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_ERROR:
            return {
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};