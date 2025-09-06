import getDesignationByPostTypes from "./constant"; 

type AuthAction = { type: string, payload: {} | string };

// start expenses report List
export const getDesignationByPost = (data): AuthAction => ({
    type: getDesignationByPostTypes.GET_DESIGNATION_BY_POST,
    payload: data
})
export const getZoneAction = (data): AuthAction => ({
    type: getDesignationByPostTypes.GET_ZONE,
    payload: data
})