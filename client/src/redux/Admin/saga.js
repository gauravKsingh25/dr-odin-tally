import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import Admin from './constant';
import { companyStatusApi, createCompanyApi, getCompanyListApi } from './api';


// active employee create
function* companyCreate({
    payload
}) {
    try {
        yield put({
            type: Admin.COMPANY_CREATE_LOADING,
            payload: {},
        });
        const response = yield call(createCompanyApi, payload);
        if (response.data.status) {
            yield put({
                type: Admin.COMPANY_CREATE_SUCESS,
                payload: { ...response.data },
            });
            yield put({
                type: Admin.COMPANY_CREATE_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: Admin.COMPANY_CREATE_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: Admin.COMPANY_CREATE_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: Admin.COMPANY_CREATE_RESET,
            payload: {},
        });
    }
}
function* statusCompany({
    payload
}) {
    try {
        yield put({
            type: Admin.COMPANY_STATUS_LOADING,
            payload: {},
        });
        const response = yield call(companyStatusApi, payload);
        if (response.data.status) {
            yield put({
                type: Admin.COMPANY_STATUS_SUCESS,
                payload: { ...response.data },
            });
            yield put({
                type: Admin.COMPANY_STATUS_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: Admin.COMPANY_STATUS_ERROR,
                payload: { ...response.data },
            });
        }
    } 
    catch (error) {
        yield put({
            type: Admin.COMPANY_STATUS_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: Admin.COMPANY_STATUS_RESET,
            payload: {},
        });
    }
}
function* getCompanyList({

    payload
}) {
    try {
        yield put({
            type: Admin.COMPANY_LIST_LOADING,
            payload: {},
        });
        const response = yield call(getCompanyListApi, payload);
        if (response.data.status) {
            yield put({
                type: Admin.COMPANY_LIST_SUCESS,
                payload: { ...response.data },
            });
            yield put({
                type: Admin.COMPANY_LIST_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: Admin.COMPANY_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: Admin.COMPANY_LIST_ERROR,
            payload: { message: error?.message },
        });
    }
}
export function* createCompany(): any {
    yield takeEvery(Admin.CREATE_COMPANY, companyCreate);
}
export function* companyStatus(): any {
    yield takeEvery(Admin.COMPANY_STATUS, statusCompany);
}
export function* getCompany(): any {
    yield takeEvery(Admin.COMPANY_LIST, getCompanyList);
}
function* AdminSaga(): any {
    yield all([
        fork(createCompany),
        fork(companyStatus),
        fork(getCompany),
    ]);
}

export default AdminSaga;