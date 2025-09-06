import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import { createStateApi,deleteStateApi,getStateApi,getcityBystateApi,deleteCityApi,createCity,deleteDesignationApi,getCityApi,insertDesignationApis, updateStateApi, updateDesignationApi, createProjectionApi, getProjectionApi, updateProjectionApi,updateCityApi, getStateByZoneApi, createZoneApi, getZoneApi, updateZoneApi, deleteZoneApi,getFullMonthsApi, addMonthTargetApi } from './api';
import CreateStateActionTypes from './constants';


function* stateCreate({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.CREATE_STATE_LOADING,
        payload: {},
    });
    const response = yield call(createStateApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.CREATE_STATE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.CREATE_STATE_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.CREATE_STATE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.CREATE_STATE_ERROR,
        payload: { message: error?.message },
    });
}
}
function* getStateData({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_STATE_LOADING,
        payload: {},
    });
    const response = yield call(getStateApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_STATE_SUCESS,
            payload: { ...response.data },
        });
        // yield put({
        //     type: CreateStateActionTypes.GET_STATE_RESET,
        //     payload: { },
        // });
    } else {
        yield put({
            type: CreateStateActionTypes.GET_STATE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_STATE_ERROR,
        payload: { message: error?.message },
    });
}
}


function* createCityData({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.CREATE_CITY_LOADING,
        payload: {},
    });
    const response = yield call(createCity,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.CREATE_CITY_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.CREATE_CITY_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.CREATE_CITY_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.CREATE_CITY_ERROR,
        payload: { message: error?.message },
    });
    yield put({
        type: CreateStateActionTypes.CREATE_CITY_RESET,
        payload: { },
    });
}
}

function* getCityData({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_CITY_LOADING,
        payload: {},
    });
    const response = yield call(getCityApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_CITY_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.GET_CITY_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.GET_CITY_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_CITY_ERROR,
        payload: { message: error?.message },
    });
}
}
function* createDesignation({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.INSERT_DESIGNATION_LOADING,
        payload: {},
    });
    const response = yield call(insertDesignationApis,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.INSERT_DESIGNATION_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.INSERT_DESIGNATION_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.INSERT_DESIGNATION_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.INSERT_DESIGNATION_ERROR,
        payload: { message: error?.message },
    });
    yield put({
        type: CreateStateActionTypes.INSERT_DESIGNATION_RESET,
        payload: { },
    });
}
}
function* deleteState({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.DELETE_STATE_LOADING,
        payload: {},
    });
    const response = yield call(deleteStateApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.DELETE_STATE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.DELETE_STATE_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.DELETE_STATE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.DELETE_STATE_ERROR,
        payload: { message: error?.message },
    });
}
}

function* updateState({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.UPDATE_STATE_LOADING,
        payload: {},
    });
    const response = yield call(updateStateApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.UPDATE_STATE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.UPDATE_STATE_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.UPDATE_STATE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.UPDATE_STATE_ERROR,
        payload: { message: error?.message },
    });
}
}
function* updateCity({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.UPDATE_CITY_LOADING,
        payload: {},
    });
    const response = yield call(updateCityApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.UPDATE_CITY_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.UPDATE_CITY_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.UPDATE_CITY_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.UPDATE_CITY_ERROR,
        payload: { message: error?.message },
    });
}
}
function* deleteCity({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.DELETE_CITY_LOADING,
        payload: {},
    });
    const response = yield call(deleteCityApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.DELETE_CITY_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.DELETE_CITY_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.DELETE_CITY_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.DELETE_CITY_ERROR,
        payload: { message: error?.message },
    });
}
}

function* updatedDesignation({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.UPDATE_DESIGNATION_LOADING,
        payload: {},
    });
    const response = yield call(updateDesignationApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.UPDATE_DESIGNATION_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.UPDATE_DESIGNATION_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.UPDATE_DESIGNATION_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.UPDATE_DESIGNATION_ERROR,
        payload: { message: error?.message },
    });
}
}
function* deleteDesignation({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.DELETE_DESIGNATION_LOADING,
        payload: {},
    });
    const response = yield call(deleteDesignationApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.DELETE_DESIGNATION_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.DELETE_DESIGNATION_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.DELETE_DESIGNATION_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.DELETE_DESIGNATION_ERROR,
        payload: { message: error?.message },
    });
}
}
function* createProjectionData({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.CREATE_PROJECTION_LOADING,
        payload: {},
    });
    const response = yield call(createProjectionApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.CREATE_PROJECTION_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.CREATE_PROJECTION_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.CREATE_PROJECTION_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.CREATE_PROJECTION_ERROR,
        payload: { message: error?.message },
    });
}
}
function* getProjectionData({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_PROJECTION_LOADING,
        payload: {},
    });
    const response = yield call(getProjectionApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_PROJECTION_SUCESS,
            payload: { ...response.data },
        });
        // yield put({
        //     type: CreateStateActionTypes.GET_PROJECTION_RESET,
        //     payload: { },
        // });
    } else {
        yield put({
            type: CreateStateActionTypes.GET_PROJECTION_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_PROJECTION_ERROR,
        payload: { message: error?.message },
    });
}
}
function* updatedProjection({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.UPDATE_PROJECTION_LOADING,
        payload: {},
    });
    const response = yield call(updateProjectionApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.UPDATE_PROJECTION_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.UPDATE_PROJECTION_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.UPDATE_PROJECTION_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.UPDATE_PROJECTION_ERROR,
        payload: { message: error?.message },
    });
}
}
function* getCityByState({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_CITY_BY_STATE_LOADING,
        payload: {},
    });
    const response = yield call(getcityBystateApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_CITY_BY_STATE_SUCESS,
            payload: { ...response.data },
        });
        // yield put({
        //     type: CreateStateActionTypes.GET_CITY_BY_STATE_RESET,
        //     payload: { },
        // });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.GET_CITY_BY_STATE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_CITY_BY_STATE_ERROR,
        payload: { message: error?.message },
    });
}
}
function* getStateByZone({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_STATE_BY_ZONE_LOADING,
        payload: {},
    });
    const response = yield call(getStateByZoneApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_STATE_BY_ZONE_SUCESS,
            payload: { ...response.data },
        });
        // yield put({
        //     type: CreateStateActionTypes.GET_STATE_BY_ZONE_RESET,
        //     payload: { },
        // });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.GET_STATE_BY_ZONE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_STATE_BY_ZONE_ERROR,
        payload: { message: error?.message },
    });
}
}


function* createZoneData({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.CREATE_ZONE_LOADING,
        payload: {},
    });
    const response = yield call(createZoneApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.CREATE_ZONE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.CREATE_ZONE_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.CREATE_ZONE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.CREATE_ZONE_ERROR,
        payload: { message: error?.message },
    });
}
}

function* getZoneData({
    
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_ZONE_LOADING,
        payload: {},
    });
    const response = yield call(getZoneApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_ZONE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.GET_ZONE_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.GET_ZONE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_ZONE_ERROR,
        payload: { message: error?.message },
    });
}
}
function* updateZone({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.UPDATE_ZONE_LOADING,
        payload: {},
    });
    const response = yield call(updateZoneApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.UPDATE_ZONE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.UPDATE_ZONE_RESET,
            payload: { },
        });
    } else {
        yield put({
            type: CreateStateActionTypes.UPDATE_ZONE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.UPDATE_ZONE_ERROR,
        payload: { message: error?.message },
    });
}
}
function* deleteZone({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.DELETE_ZONE_LOADING,
        payload: {},
    });
    const response = yield call(deleteZoneApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.DELETE_ZONE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.DELETE_ZONE_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.DELETE_ZONE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.DELETE_ZONE_ERROR,
        payload: { message: error?.message },
    });
}
}
function* getFullMonths({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.GET_FULL_MONTHS_LOADING,
        payload: {},
    });
    const response = yield call(getFullMonthsApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.GET_FULL_MONTHS_SUCCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.GET_FULL_MONTHS_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.GET_FULL_MONTHS_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.GET_FULL_MONTHS_ERROR,
        payload: { message: error?.message },
    });
}
}
function* getMonthTarget({
    payload
}) {
    try {
    yield put({
        type: CreateStateActionTypes.ADD_MONTHS_TARGET_LOADING,
        payload: {},
    });
    const response = yield call(addMonthTargetApi,payload );
    if (response.data.status) {
        yield put({
            type: CreateStateActionTypes.ADD_MONTHS_TARGET_SUCCESS,
            payload: { ...response.data },
        });
        yield put({
            type: CreateStateActionTypes.ADD_MONTHS_TARGET_RESET,
            payload: { },
        });
    } 
    else {
        yield put({
            type: CreateStateActionTypes.ADD_MONTHS_TARGET_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: CreateStateActionTypes.ADD_MONTHS_TARGET_ERROR,
        payload: { message: error?.message },
    });
}
}
export function* createstate(): any {
    yield takeEvery(CreateStateActionTypes.CREATE_STATE, stateCreate);
}
export function* getState(): any {
    yield takeEvery(CreateStateActionTypes.GET_STATE, getStateData);
}
export function* createCitySaga(): any {
    yield takeEvery(CreateStateActionTypes.CREATE_CITY, createCityData)
}
export function* getCitySaga(): any {
    yield takeEvery(CreateStateActionTypes.GET_CITY, getCityData)
}
export function* createDesignationSaga ():any{
    yield takeEvery(CreateStateActionTypes.INSERT_DESIGNATION, createDesignation)
}
export function* UpdateStateSaga ():any{
    yield takeEvery(CreateStateActionTypes.UPDATE_STATE, updateState)
}
export function* UpdateDesignationSaga ():any{
    yield takeEvery(CreateStateActionTypes.UPDATE_DESIGNATION, updatedDesignation)
}
export function* createProjectionSaga(): any {
    yield takeEvery(CreateStateActionTypes.CREATE_PROJECTION, createProjectionData)
}
export function* getProjectionSaga(): any {
    yield takeEvery(CreateStateActionTypes.GET_PROJECTION, getProjectionData)
}
export function* updateCitySaga(): any {
    yield takeEvery(CreateStateActionTypes.UPDATE_CITY, updateCity)
} 
export function* UpdateProjectionSaga ():any{
    yield takeEvery(CreateStateActionTypes.UPDATE_PROJECTION, updatedProjection)
}
export function* deleteDesignationSaga(): any {
    yield takeEvery(CreateStateActionTypes.DELETE_DESIGNATION,deleteDesignation)
}
export function* deleteCitySaga(): any {
    yield takeEvery(CreateStateActionTypes.DELETE_CITY,deleteCity)
}
export function* deleteStateSaga(): any {
    yield takeEvery(CreateStateActionTypes.DELETE_STATE,deleteState)
}
export function* getCityByStateSaga(): any {
    yield takeEvery(CreateStateActionTypes.GET_CITY_BY_STATE,getCityByState)
}
export function* getStateByZoneSaga(): any {
    yield takeEvery(CreateStateActionTypes.GET_STATE_BY_ZONE,getStateByZone)
}
export function* createZoneSaga(): any {
    yield takeEvery(CreateStateActionTypes.CREATE_ZONE, createZoneData)
}
export function* getZone(): any {
    yield takeEvery(CreateStateActionTypes.GET_ZONE, getZoneData);
}
export function* updateZoneSaga(): any {
    yield takeEvery(CreateStateActionTypes.UPDATE_ZONE, updateZone)
} 
export function* deleteZoneSaga(): any {
    yield takeEvery(CreateStateActionTypes.DELETE_ZONE,deleteZone)
}
export function* getFullMonthSaga(): any {
    yield takeEvery(CreateStateActionTypes.GET_FULL_MONTHS,getFullMonths)
}
export function* getMonthTargetSaga(): any {
    yield takeEvery(CreateStateActionTypes.ADD_MONTHS_TARGET,getMonthTarget)
}
function* stateCreateSaga(): any {
    yield all([ 
        fork(createstate),
        fork(getState),
        fork(createCitySaga),
        fork(createDesignationSaga),
        fork(getCitySaga),
        fork(UpdateStateSaga),
        fork(UpdateDesignationSaga),
        fork(createProjectionSaga),
        fork(getProjectionSaga),
        fork(updateCitySaga),
        fork(UpdateProjectionSaga),
        fork(deleteDesignationSaga),
        fork(deleteCitySaga),
        fork(deleteStateSaga),
        fork(getCityByStateSaga),
        fork(getStateByZoneSaga),
        fork(createZoneSaga),
        fork(getZone),
        fork(updateZoneSaga),
        fork(deleteZoneSaga),
        fork(getFullMonthSaga),
        fork(getMonthTargetSaga),
    ]);
}

export default stateCreateSaga;