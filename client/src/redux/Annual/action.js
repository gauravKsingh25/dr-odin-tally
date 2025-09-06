import GraphTypes from "./constant";

export const getAnnualSaleSummary = (data): AuthAction => ({
    type: GraphTypes.GET_ANNUAL_SALARY_SUMMARY,
    payload: data
})

export const SalesVSSalary = (data): AuthAction => ({
    type :GraphTypes.GET_SALES_VS_SALARY,
    payload: data
})

export const AnnalTargetSummmary = (data): AuthAction => ({
    type :GraphTypes.GET_ANNUAL_TARGET_SUMMARY,
    payload: data
})