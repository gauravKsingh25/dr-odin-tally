import Admin from "./constant";

type AuthAction = { type: string, payload: {} | string };
// create Company
export const createCompanyAction = (data): AuthAction => ({
    type: Admin.CREATE_COMPANY,
    payload: data
})
export const companyStatusAction = (data): AuthAction => ({
    type: Admin.COMPANY_STATUS,
    payload: data
})
export const companyListAction = (data): AuthAction => ({
    type: Admin.COMPANY_LIST,
    payload: data 
})

