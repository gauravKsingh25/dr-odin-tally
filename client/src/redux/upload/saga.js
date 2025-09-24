import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import uploadTypes from './constants';
import { uploadTellyReportApi,uploadSecondTellyReportApi,uploadSalaryReportApi, uploadRateDifferenceReportApi, uploadVoucherExcelApi } from './api';

// active employee create
function* UploadTellyyReport({
    payload
}) {

    try {
        yield put({
            type: uploadTypes.UPLOAD_TELLY_LOADING,
            payload: {},
        });
        const response = yield call(uploadTellyReportApi,payload );
        if (response.data.status) {
            yield put({
                type: uploadTypes.UPLOAD_TELLY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_TELLY_RESET,
                payload: { },
            });

        } else {
            yield put({
                type: uploadTypes.UPLOAD_TELLY_ERROR,
                payload: { ...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_TELLY_RESET,
                payload: { },
            });
        }
    } catch (error) {
        yield put({
            type: uploadTypes.UPLOAD_TELLY_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: uploadTypes.UPLOAD_TELLY_RESET,
            payload: { },
        });
    }
}

function* UploadSecondTellyReport({payload}){
    try {
        yield put({
            type: uploadTypes.UPLOAD_SECOND_FILE_LOADING,
            payload: {},
        });
        const response = yield call(uploadSecondTellyReportApi,payload );
        if (response.data.status) {
            yield put({
                type: uploadTypes.UPLOAD_SECOND_FILE_SUCCESS,
                payload: {...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_SECOND_FILE_RESET,
                payload: {} ,
            });
        } else {
            yield put({
                type: uploadTypes.UPLOAD_SECOND_FILE_ERROR,
                payload: {...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_SECOND_FILE_RESET,
                payload: {} ,
            });
        }

    } catch (error) {
        yield put({
            type: uploadTypes.UPLOAD_SECOND_FILE_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: uploadTypes.UPLOAD_SECOND_FILE_RESET,
            payload: {} ,
        });
    }
}
function* UploadSalaryReport({payload}){
    try {
        yield put({
            type: uploadTypes.UPLOAD_SALARY_FILE_LOADING,
            payload: {},
        });
        const response = yield call(uploadSalaryReportApi,payload );
        if (response.data.status) {
            yield put({
                type: uploadTypes.UPLOAD_SALARY_FILE_SUCCESS,
                payload: {...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_SALARY_FILE_RESET,
                payload: {} ,
            });
        } else {
            yield put({
                type: uploadTypes.UPLOAD_SALARY_FILE_ERROR,
                payload: {...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_SALARY_FILE_RESET,
                payload: {} ,
            });
        }
    } catch (error) {
        yield put({
            type: uploadTypes.UPLOAD_SALARY_FILE_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: uploadTypes.UPLOAD_SALARY_FILE_RESET,
            payload: {} ,
        });
    }
}

function* UploadRateDifferenceReport({payload}){
    try {
        yield put({
            type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_LOADING,
            payload: {},
        });
        const response = yield call(uploadRateDifferenceReportApi,payload );
        if (response.data.status) {
            yield put({
                type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_SUCCESS,
                payload: {...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_RESET,
                payload: {} ,
            });
        } else {
            yield put({
                type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_ERROR,
                payload: {...response.data },
            });
            yield put({
                type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_RESET,
                payload: {} ,
            });
        }
    } catch (error) {
        yield put({
            type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_RESET,
            payload: {} ,
        });
    }
}

// Voucher Excel Upload
function* UploadVoucherExcel({payload}){
    try {
        yield put({
            type: uploadTypes.UPLOAD_VOUCHER_EXCEL_LOADING,
            payload: {},
        });
        const response = yield call(uploadVoucherExcelApi, payload);
        
        // Handle case when response or response.data is undefined
        if (response && response.data && (response.data.status === 201 || response.data.status === 200)) {
            yield put({
                type: uploadTypes.UPLOAD_VOUCHER_EXCEL_SUCCESS,
                payload: {...response.data },
            });
        } else {
            yield put({
                type: uploadTypes.UPLOAD_VOUCHER_EXCEL_ERROR,
                payload: (response && response.data && response.data.message) || 'Upload failed',
            });
        }
    } catch (error) {
        console.error('Voucher upload error:', error);
        yield put({
            type: uploadTypes.UPLOAD_VOUCHER_EXCEL_ERROR,
            payload: error?.response?.data?.message || error?.message || 'Upload failed',
        });
    }
}


export function* uploadTellyReportApii() {
    yield takeEvery(uploadTypes.UPLOAD_TELLY, UploadTellyyReport);
}
export function* uploadSecondTellyReport(){
    yield takeEvery(uploadTypes.UPLOAD_SECOND_FILE, UploadSecondTellyReport);
}

export function* uploadSalaryReportSaga() {
    yield takeEvery(uploadTypes.UPLOAD_SALARY_FILE, UploadSalaryReport);
}
export function* uploadRateDifferenceReportSaga() {
    yield takeEvery(uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE, UploadRateDifferenceReport);
}

export function* uploadVoucherExcelSaga() {
    yield takeEvery(uploadTypes.UPLOAD_VOUCHER_EXCEL, UploadVoucherExcel);
}

function* uploadTellyReportSaga() {
    yield all([
        fork(uploadTellyReportApii),
        fork(uploadSecondTellyReport),
        fork(uploadSalaryReportSaga),
        fork(uploadRateDifferenceReportSaga),
        fork(uploadVoucherExcelSaga),
    ]);
}

export default uploadTellyReportSaga;
