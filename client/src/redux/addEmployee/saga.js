import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import getDesignationByPostTypes from './constant';
import { GetDesignation, GetZoneList } from './api';

// start month List
function* GetDesignationList({ payload }) {
    try {
        yield put({
            type: getDesignationByPostTypes.GET_DESIGNATION_BY_POST_LOADING,
            payload: {},
        });
        const response = yield call(GetDesignation, payload);
        if (response.data.status) {
            yield put({
                type: getDesignationByPostTypes.GET_DESIGNATION_BY_POST_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: getDesignationByPostTypes.GET_DESIGNATION_BY_POST_RESET,
            //     payload: {},
            // });
        } else {
            yield put({
                type: getDesignationByPostTypes.GET_DESIGNATION_BY_POST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: getDesignationByPostTypes.GET_DESIGNATION_BY_POST_ERROR,
            payload: { message: error.message },
        });
    }
}
// end month List

function* getZoneList() {
    try {
        yield put({
            type: getDesignationByPostTypes.GET_ZONE_LOADING,
            payload: {},
        });
        const response = yield call(GetZoneList,);
        if (response.data.status) {
            yield put({
                type: getDesignationByPostTypes.GET_ZONE_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: getDesignationByPostTypes.GET_ZONE_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: getDesignationByPostTypes.GET_ZONE_ERROR,
            payload: { message: error?.message },
        });
    }
}


export function* getDesignation(): any {
    yield takeEvery(getDesignationByPostTypes.GET_DESIGNATION_BY_POST, GetDesignationList);
}
export function* getZone(): any {
    yield takeEvery(getDesignationByPostTypes.GET_ZONE, getZoneList)
}


function* getDesignationSaga(): any {
    yield all([
        fork(getDesignation),
        fork(getZone)
    ]);
}

export default getDesignationSaga;
