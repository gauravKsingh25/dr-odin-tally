import ActiveEmployeeActionTypes from "./constant";

type AuthAction = { type: string, payload: {} | string };

// start active employee list
export const activeEmployeeListAction = (data): AuthAction => ({
    type: ActiveEmployeeActionTypes.GET_EMPLOYEE_LIST,
    payload: data 
})

// start active employee create
export const activeEmployeeCreateAction = (data): AuthAction => ({
    type: ActiveEmployeeActionTypes.CREATE_EMPLOYEE,
    payload: data
})
export const activeEmployeeUpdateAction = (data): AuthAction =>({
    type: ActiveEmployeeActionTypes.UPDATE_EMPLOYEE,
    payload: data
})
export const reportingManagerByDesignationAction = (data): AuthAction => ({
    type: ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION,
    payload: data
})
