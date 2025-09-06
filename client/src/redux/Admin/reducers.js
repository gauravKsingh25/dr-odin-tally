import Admin from "./constant";
const COMPANY_CREATE_INITIAL_STATE = {
    loading: false,
    message:""
};
const COMPANY_LIST_INITIAL_STATE = {
    loading: false,
    message:""
};
const COMPANY_STATUS_INITIAL_STATE = {
    loading: false,
    message:""
};

export const companyCreateReducer = (state = COMPANY_CREATE_INITIAL_STATE, action) => {
    switch (action.type) {
        case Admin.COMPANY_CREATE_LOADING:
            return {
                loading: true,
            };
        case Admin.COMPANY_CREATE_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case Admin.COMPANY_CREATE_RESET:
            return COMPANY_CREATE_INITIAL_STATE
        case Admin.COMPANY_CREATE_ERROR:
            return {
                loading: false,
                message:"",
                status:405
            };
        default:
            return { ...state };
    }
};
export const companyStatusReducer = (state = COMPANY_STATUS_INITIAL_STATE, action) => {
    switch (action.type) {
        case Admin.COMPANY_STATUS_LOADING:
            return {
                loading: true,
            };
        case Admin.COMPANY_STATUS_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case Admin.COMPANY_STATUS_RESET:
            return COMPANY_STATUS_INITIAL_STATE
        case Admin.COMPANY_STATUS_ERROR:
            return {
                loading: false,
                message:"",
                status:405
            };
        default:
            return { ...state };
    }
};
export const getCompanyListReducer = (state = COMPANY_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case Admin.COMPANY_LIST_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case Admin.COMPANY_LIST_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        // case Admin.GET_CITY_RESET:
        //     return COMPANY_LIST_INITIAL_STATE
        case Admin.COMPANY_LIST_ERROR:
            return {
                data:state.data,
                loading: false,
              ...action?.payload
            };
        default:
            return { ...state };
    }
};