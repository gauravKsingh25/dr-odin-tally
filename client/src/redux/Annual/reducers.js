import GraphTypes from "./constant";
let annualSaleSummaryInitial = {
data:[],
loading: false,
}
let saleVsSalary = {
    data:[],
    loading: false,
    }

export const annualSaleSummaryReducer = (state = annualSaleSummaryInitial, action) => {
    switch (action.type) {
        case GraphTypes.GET_ANNUAL_SALARY_SUMMARY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case GraphTypes.GET_ANNUAL_SALARY_SUMMARY_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
            case GraphTypes.GET_ANNUAL_SALARY_SUMMARY_RESET:
                return annualSaleSummaryInitial
        case GraphTypes.GET_ANNUAL_SALARY_SUMMARY_ERROR:
            return {
                data:state.data,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const annualSalesVsSalary = (state = saleVsSalary, action) => {
    switch (action.type) {
        case GraphTypes.GET_SALES_VS_SALARY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case GraphTypes.GET_SALES_VS_SALARY_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
            case GraphTypes.GET_SALES_VS_SALARY_RESET:
                return saleVsSalary
        case GraphTypes.GET_SALES_VS_SALARY_ERROR:
            return {
                data:state.data,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const annualTargetSummaryReducer = (state = saleVsSalary, action) => {
    switch (action.type) {
        case GraphTypes.GET_ANNUAL_TARGET_SUMMARY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case GraphTypes.GET_ANNUAL_TARGET_SUMMARY_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
            case GraphTypes.GET_ANNUAL_TARGET_SUMMARY_RESET:
                return saleVsSalary
        case GraphTypes.GET_ANNUAL_TARGET_SUMMARY_ERROR:
            return {
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};