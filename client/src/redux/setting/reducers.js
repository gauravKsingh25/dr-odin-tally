import CreateStateActionTypes from "./constants";

const STATE_CREATE_INITIAL_STATE = {
    loading: false,
    message:""
};
const getState = {
    loading: false,
    data:[]
}
const getCity = {
    loading: false,
    data:[]
}
const getZone = {
    loading: false,
    data:[]
}
const updateState = {
    loading: false,
    data:[]
}
const updateDesignation = {
    loading: false,
    data:[]
}
const updateZone = {
    loading: false,
    data:[]
}
const createProjection = {
    loading: false,
    data:[]
}
const updateProjection = {
    loading: false,
    data:[]
}
const deleteProjection = {
    loading: false,
    data:[]
}
export const StateCreateReducer = (state = STATE_CREATE_INITIAL_STATE, action) => {
    switch (action.type) {
        case CreateStateActionTypes.CREATE_STATE_LOADING:
            return {
                loading: true,
            };
        case CreateStateActionTypes.CREATE_STATE_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.CREATE_STATE_RESET:
            return STATE_CREATE_INITIAL_STATE
        case CreateStateActionTypes.CREATE_STATE_ERROR:
            return {
                loading: false,
                message:action?.payload
            };
        default:
            return { ...state };
    }
};

export const getStateReducer = (state = getState, action) => {
    switch (action.type) {
        case CreateStateActionTypes.GET_STATE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_STATE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        // case CreateStateActionTypes.GET_STATE_RESET:
        //     return getState
        case CreateStateActionTypes.GET_STATE_ERROR:
            return {
                data:state.data,
                loading: false,
              ...action?.payload
            };
        default:
            return { ...state };
    }
};


export const createCityReducer = (state = getState, action) => {
    switch (action.type) {
        case CreateStateActionTypes.CREATE_CITY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.CREATE_CITY_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.CREATE_CITY_RESET:
            return {loading:false}
        case CreateStateActionTypes.CREATE_CITY_ERROR:
            return {
                loading:false,
                status:400
            };
        default:
            return { ...state };
    }
};

export const getCityReducer = (state = getCity, action) => {
    switch (action.type) {
        case CreateStateActionTypes.GET_CITY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_CITY_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        // case CreateStateActionTypes.GET_CITY_RESET:
        //     return getCity
        case CreateStateActionTypes.GET_CITY_ERROR:
            return {
                data:state.data,
                loading: false,
              ...action?.payload
            };
        default:
            return { ...state };
    }
};

export const InsertDesignationReducer = (state = getCity, action) => {
    switch (action.type) {
        case CreateStateActionTypes.INSERT_DESIGNATION_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.INSERT_DESIGNATION_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.INSERT_DESIGNATION_RESET:
            return getCity
            case CreateStateActionTypes.INSERT_DESIGNATION_ERROR:
                return {
                    loading:false,
                    status:400
                };
        default:
            return { ...state };
    }
};
export const UpdateStateReducer = (state = updateState, action) => {
    switch (action.type) {
        case CreateStateActionTypes.UPDATE_STATE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.UPDATE_STATE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.UPDATE_STATE_RESET:
            return updateState
        case CreateStateActionTypes.UPDATE_STATE_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const UpdateDesignationReducer = (state = updateDesignation, action) => {
    switch (action.type) {
        case CreateStateActionTypes.UPDATE_DESIGNATION_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.UPDATE_DESIGNATION_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.UPDATE_DESIGNATION_RESET:
            return updateDesignation
        case CreateStateActionTypes.UPDATE_DESIGNATION_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};

export const deleteDesignationReducer = (state = updateDesignation, action) => {
    switch (action.type) {
        case CreateStateActionTypes.DELETE_DESIGNATION_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.DELETE_DESIGNATION_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.DELETE_DESIGNATION_RESET:
            return updateDesignation
        case CreateStateActionTypes.DELETE_DESIGNATION_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};

export const UpdateCityReducer = (state = updateDesignation, action) => {
    switch (action.type) {
        case CreateStateActionTypes.UPDATE_CITY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.UPDATE_CITY_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.UPDATE_CITY_RESET:
            return updateDesignation
        case CreateStateActionTypes.UPDATE_CITY_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const CreateProjectionReducer = (state = createProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.CREATE_PROJECTION_LOADING:
            return {
                loading: true,
            };
        case CreateStateActionTypes.CREATE_PROJECTION_SUCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.CREATE_PROJECTION_RESET:
            return createProjection
        case CreateStateActionTypes.CREATE_PROJECTION_ERROR:
            return {
                loading: false,
                message:action?.payload
            };
        default:
            return { ...state };
    }
};
export const GetProjectionReducer = (state = createProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.GET_PROJECTION_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_PROJECTION_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        // case CreateStateActionTypes.GET_PROJECTION_RESET:
        //     return createProjection
        case CreateStateActionTypes.GET_PROJECTION_ERROR:
            return {
                data:state.data,
                loading: false,
              ...action?.payload
            };
        default:
            return { ...state };
    }
};
export const UpdateProjectionReducer = (state = updateProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.UPDATE_PROJECTION_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.UPDATE_PROJECTION_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.UPDATE_PROJECTION_RESET:
            return updateProjection
        case CreateStateActionTypes.UPDATE_PROJECTION_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const deleteCityReducer = (state = updateProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.DELETE_CITY_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.DELETE_CITY_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.DELETE_CITY_RESET:
            return updateProjection
        case CreateStateActionTypes.DELETE_CITY_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const deleteStateReducer = (state = updateProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.DELETE_STATE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.DELETE_STATE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.DELETE_STATE_RESET:
            return updateProjection
        case CreateStateActionTypes.DELETE_STATE_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const getCityByState = (state=updateProjection,action)=>{
    switch (action.type) {
        case CreateStateActionTypes.GET_CITY_BY_STATE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_CITY_BY_STATE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.GET_CITY_BY_STATE_RESET:
            return updateProjection
        case CreateStateActionTypes.GET_CITY_BY_STATE_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return {...state };
    }
}
export const getStateByZoneReducer = (state=updateProjection,action)=>{
    switch (action.type) {
        case CreateStateActionTypes.GET_STATE_BY_ZONE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_STATE_BY_ZONE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.GET_STATE_BY_ZONE_RESET:
            return updateProjection
        case CreateStateActionTypes.GET_STATE_BY_ZONE_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return {...state };
    }
}
export const createZoneReducer = (state = getState, action) => {
    switch (action.type) {
        case CreateStateActionTypes.CREATE_ZONE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.CREATE_ZONE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.CREATE_ZONE_RESET:
            return {loading:false}
        case CreateStateActionTypes.CREATE_ZONE_ERROR:
            return {
                data:state.data,
                loading: false,
              ...action?.payload
            };
        default:
            return { ...state };
    }
};
export const getZoneReducer = (state = getZone, action) => {
    switch (action.type) {
        case CreateStateActionTypes.GET_ZONE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_ZONE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        // case CreateStateActionTypes.GET_CITY_RESET:
        //     return getZone
        case CreateStateActionTypes.GET_ZONE_ERROR:
            return {
                data:state.data,
                loading: false,
              ...action?.payload
            };
        default:
            return { ...state };
    }
};
export const UpdateZoneReducer = (state = updateZone, action) => {
    switch (action.type) {
        case CreateStateActionTypes.UPDATE_ZONE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.UPDATE_ZONE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.UPDATE_ZONE_RESET:
            return updateZone
        case CreateStateActionTypes.UPDATE_ZONE_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const deleteZoneReducer = (state = deleteProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.DELETE_ZONE_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.DELETE_ZONE_SUCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.DELETE_ZONE_RESET:
            return deleteProjection
        case CreateStateActionTypes.DELETE_ZONE_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const getFullMonthReucer = (state = deleteProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.GET_FULL_MONTHS_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.GET_FULL_MONTHS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        // case CreateStateActionTypes.GET_FULL_MONTHS_RESET:
        //     return deleteProjection
        case CreateStateActionTypes.GET_FULL_MONTHS_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};
export const addMonthTaregtReducer = (state = deleteProjection, action) => {
    switch (action.type) {
        case CreateStateActionTypes.ADD_MONTHS_TARGET_LOADING:
            return {
                data:state.data,
                loading: true,
            };
        case CreateStateActionTypes.ADD_MONTHS_TARGET_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case CreateStateActionTypes.ADD_MONTHS_TARGET_RESET:
            return deleteProjection
        case CreateStateActionTypes.ADD_MONTHS_TARGET_ERROR:
            return {
                loading: false,
                data:state.data,
              
            };
        default:
            return { ...state };
    }
};