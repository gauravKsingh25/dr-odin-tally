import getDesignationByPostTypes from "./constant";
const getDesignationState = {
    getDesignation: [],
    loading: false,
};
const getZoneListState = {
    getZoneList: [],
    loading: false,
}

export const GetDesignationReducer = (state = getDesignationState, action) => {
    switch (action.type) {
        case getDesignationByPostTypes.GET_DESIGNATION_BY_POST_LOADING:
            return {
                getDesignation: state.getDesignation,
                loading: true,
            };
        case getDesignationByPostTypes.GET_DESIGNATION_BY_POST_SUCCESS:
            return {
                getDesignation: action?.payload,
                loading: false,
            };
        case getDesignationByPostTypes.GET_DESIGNATION_BY_POST_RESET:
            return getDesignationState
        case getDesignationByPostTypes.GET_DESIGNATION_BY_POST_ERROR:
            return {
                getDesignation: state.getDesignation,
                loading: false,
            };
        default:
            return { ...state };
    }
};
export const getZoneListReducer = (state = getZoneListState, action) => {
    switch (action.type) {
        case getDesignationByPostTypes.GET_ZONE_LOADING:
            return {
                getDesignation: state.getDesignation,
                loading: true,
            };
        case getDesignationByPostTypes.GET_ZONE_SUCCESS:
            return {
                getDesignation: action?.payload,
                loading: false,
            };
        case getDesignationByPostTypes.GET_ZONE_ERROR:
            return {
                getDesignation: state.MonthList,
                loading: false,
            };
        default:
            return { ...state };
    }
};
