import ActiveEmployeeActionTypes from "./constant";

const ACTIVE_EMPLOYEE_LIST_INITIAL_STATE = {
    activeEmployeeList : [],
    loading: false,
};

const ACTIVE_EMPLOYEE_CREATE_INITIAL_STATE = {
    loading: false,
    message:""
};

const ACTIVE_EMPLOYEE_UPDATE_INITIAL_STATE = {
    loading: false,
    message:""
};

const REPORTING_MANAGER_CREATE_INITIAL_STATE = {
    loading: false,
    message:""
};
export const ActiveEmployeeListReducer = (state = ACTIVE_EMPLOYEE_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case ActiveEmployeeActionTypes.EMPLOYEE_LIST_LOADING:
            return {
                activeEmployeeList:state.activeEmployeeList,
                loading: true,
            };
        case ActiveEmployeeActionTypes.EMPLOYEE_LIST_SUCESS:
            return {
                activeEmployeeList: action?.payload,
                loading: false, 
            };
        // case ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET:
        //     return ACTIVE_EMPLOYEE_CREATE_INITIAL_STATE
        case ActiveEmployeeActionTypes.EMPLOYEE_LIST_ERROR:
            return {
                activeEmployeeList:state.activeEmployeeList,
                loading: false,
                mesage:action?.payload
            };
        default:
            return { ...state };
    }
};
export const ActiveEmployeeCreateReducer = (state = ACTIVE_EMPLOYEE_CREATE_INITIAL_STATE, action) => {
    switch (action.type) {
        case ActiveEmployeeActionTypes.EMPLOYEE_CREATE_LOADING:
            return {
                loading: true,
            };
        case ActiveEmployeeActionTypes.EMPLOYEE_CREATE_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET:
            return ACTIVE_EMPLOYEE_CREATE_INITIAL_STATE
        case ActiveEmployeeActionTypes.EMPLOYEE_CREATE_ERROR:
            return {
                loading: false,
                message:"",
                status:405
            };
        default:
            return { ...state };
    }
};
export const ActiveEmployeeUpdateReducer = (state = ACTIVE_EMPLOYEE_UPDATE_INITIAL_STATE, action) => {
    switch (action.type) {
        case ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_LOADING:
            return {
                loading: true,
            };
        case ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET:
            return ACTIVE_EMPLOYEE_CREATE_INITIAL_STATE
        case ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_ERROR:
            return {
                loading: false,
                message:action?.payload,
                status:401,
            };
        default:
            return { ...state };
    }
};
export const ReportingManagerByDesignationReducer = (state = REPORTING_MANAGER_CREATE_INITIAL_STATE, action) => {
    switch (action.type) {
        case ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_RESET:
            return REPORTING_MANAGER_CREATE_INITIAL_STATE
        case ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_ERROR:
            return {
                loading: false,
                data:state.data,
            };
        default:
            return { ...state };
    } 
};