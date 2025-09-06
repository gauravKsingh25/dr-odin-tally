import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import ActiveEmployeeActionTypes from './constant';
import { GetReportingManagerByDesignationApi, createActiveEmployeeApi, getActiveEmployeeApi, updateActiveEmployeeApi } from './api';

// active employee list
function* activeEmployeeList({payload}) {
    try {
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_LIST_LOADING,
            payload: {},
        });
        const response = yield call(getActiveEmployeeApi,{payload} );
        if (response.data.status) {
            yield put({
                type: ActiveEmployeeActionTypes.EMPLOYEE_LIST_SUCESS,
                payload: { ...response.data },
            });
        } else { 
            yield put({
                type: ActiveEmployeeActionTypes.EMPLOYEE_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_LIST_ERROR,
            payload: { message: "server error" },
        });
    }
}
// active employee create
function* activeEmployeeCreate({
        payload
}) {
        try {
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_LOADING,
            payload: {},
        });
        const response = yield call(createActiveEmployeeApi,payload );
        if (response.data.status) {
            yield put({
                type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_SUCESS,
                payload: { ...response.data },
            });
            yield put({
                type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET,
                payload: { },
            });
        } else {
            yield put({
                type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_ERROR,
                payload: { ...response.data },
            });
            // yield put({
            //     type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET,
            //     payload: { },
            // });
        }
    } catch (error) {
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET,
            payload: { },
        });
    }
}

// update active employee
function* activeEmployeeUpdate({
    
    payload
}) {
    try {
    yield put({
        type: ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_LOADING,
        payload: {},
    });
    const response = yield call(updateActiveEmployeeApi,payload );
    if (response.data.status) {
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_SUCESS,
            payload: { ...response.data },
        });
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET,
            payload: {},
        });
    } else {
        yield put({
            type: ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_ERROR,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: ActiveEmployeeActionTypes.EMPLOYEE_UPDATE_ERROR,
        payload: { message: "notupdated" },
    });
    yield put({
        type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET,
        payload: {},
    });
}
}

// reporting manager create
function* GetreportingManager({
    
    payload
}) {
    try {
    yield put({
        type: ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_LOADING,
        payload: {},
    });
    const response = yield call(GetReportingManagerByDesignationApi,payload );
    if (response.data.status) {
        yield put({
            type: ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_SUCESS,
            payload: { ...response.data },
        });
        // yield put({
        //     type: ActiveEmployeeActionTypes.EMPLOYEE_CREATE_RESET,
        //     payload: { },
        // });
    } else {
        yield put({
            type: ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_RESET,
            payload: { ...response.data },
        });
    }
} catch (error) {
    yield put({
        type: ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION_ERROR,
        payload: { message: error?.message },
    });
}
}


export function* getActiveEmployee(): any {
    yield takeEvery(ActiveEmployeeActionTypes.GET_EMPLOYEE_LIST, activeEmployeeList);
}

export function* createActiveEmploye(): any {
    yield takeEvery(ActiveEmployeeActionTypes.CREATE_EMPLOYEE, activeEmployeeCreate);
}

export function* updateActiveEmploye(): any {
    yield takeEvery(ActiveEmployeeActionTypes.UPDATE_EMPLOYEE, activeEmployeeUpdate);
}
export function* GetReportingManagerByDesination(): any {
    yield takeEvery(ActiveEmployeeActionTypes.GET_REPORTING_MANAGER_BY_DESIGNATION, GetreportingManager);
}

function* activeEmployeeSaga(): any {
    yield all([
        fork(getActiveEmployee),
        fork(createActiveEmploye),
        fork(updateActiveEmploye),
        fork(GetReportingManagerByDesination),
    ]);
}

export default activeEmployeeSaga;
