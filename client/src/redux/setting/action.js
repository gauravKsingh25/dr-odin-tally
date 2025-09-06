import CreateStateActionTypes from "./constants"
type AuthAction = { type: string, payload: {} | string };
export const StateCreateAction = (data): AuthAction => ({
    type: CreateStateActionTypes.CREATE_STATE,
    payload: data
})

export const getState= (data): AuthAction => ({
    type: CreateStateActionTypes.GET_STATE,
    payload: data
})
export const createCity = (data): AuthAction => ({
    type: CreateStateActionTypes.CREATE_CITY,
    payload: data
})

export const updateCity = (data): AuthAction => ({
    type: CreateStateActionTypes.UPDATE_CITY,
    payload: data
})

export const getCity = (data): AuthAction => ({
    type: CreateStateActionTypes.GET_CITY,
    payload: data
})


export const insertDesignation = (data): AuthAction => ({
    type: CreateStateActionTypes.INSERT_DESIGNATION,
    payload: data
})

export const updateState = (data): AuthAction => ({
    type: CreateStateActionTypes.UPDATE_STATE,
    payload: data
})
export const updateDesignation = (data): AuthAction => ({
    type: CreateStateActionTypes.UPDATE_DESIGNATION,
    payload: data
})
export const deleteDesignation = (data): AuthAction => ({
    type: CreateStateActionTypes.DELETE_DESIGNATION,
    payload: data
})
export const createProjectionAction= (data): AuthAction => ({
    type: CreateStateActionTypes.CREATE_PROJECTION,
    payload: data
})
export const getProjectionAction= (data): AuthAction => ({
    type: CreateStateActionTypes.GET_PROJECTION,
    payload: data
})
export const updateProjectionAction = (data): AuthAction => ({
    type: CreateStateActionTypes.UPDATE_PROJECTION,
    payload: data
})

export const deleteCity = (data): AuthAction => ({
    type: CreateStateActionTypes.DELETE_CITY,
    payload: data
})
export const deletState = (data): AuthAction => ({
    type: CreateStateActionTypes.DELETE_STATE,
    payload: data
})
export const getcityByState = (data): AuthAction => ({
    type: CreateStateActionTypes.GET_CITY_BY_STATE,
    payload: data
})
export const getStateByZone = (data): AuthAction => ({
    type: CreateStateActionTypes.GET_STATE_BY_ZONE,
    payload: data
})
export const createZoneAction = (data): AuthAction => ({
    type: CreateStateActionTypes.CREATE_ZONE,
    payload: data
})
export const getZoneAction = (data): AuthAction => ({
    type: CreateStateActionTypes.GET_ZONE,
    payload: data
})
export const updateZone = (data): AuthAction => ({
    type: CreateStateActionTypes.UPDATE_ZONE,
    payload: data
})
export const deleteZone = (data): AuthAction => ({
    type: CreateStateActionTypes.DELETE_ZONE,
    payload: data
})

export const getFullMonths = (data): AuthAction => ({
    type:CreateStateActionTypes.GET_FULL_MONTHS,
    payload:data
})

export const addMonthTarget = (data): AuthAction => ({
    type: CreateStateActionTypes.ADD_MONTHS_TARGET,
    payload:data
})