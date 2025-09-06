import GraphTypes from "./constant";
import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import {getAnnualSaleSummaryApi,getSalesVsSalaryReportApi,AnnualTargetSummaryApi} from "./api";

function* getAnnnualSaleSummaryReport({payload}) {
    try {
        yield put({
            type: GraphTypes.GET_ANNUAL_SALARY_SUMMARY_LOADING,
            payload: {},
        });
        const response = yield call(getAnnualSaleSummaryApi,{payload} );
        if (response.data.status) {
            yield put({
                type: GraphTypes.GET_ANNUAL_SALARY_SUMMARY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: GraphTypes.GET_ANNUAL_SALARY_SUMMARY_RESET,
                payload: {  },
            });
        } else {
            yield put({
                type: GraphTypes.GET_ANNUAL_SALARY_SUMMARY_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: GraphTypes.GET_ANNUAL_SALARY_SUMMARY_ERROR,
            payload: { message: error?.message },
        });
    }
}

function* getSalesVsSalaryReport({payload}) {
    try {
        yield put({
            type: GraphTypes.GET_SALES_VS_SALARY_LOADING,
            payload: {},
        });
        const response = yield call(getSalesVsSalaryReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: GraphTypes.GET_SALES_VS_SALARY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: GraphTypes.GET_SALES_VS_SALARY_RESET,
                payload: {  },
            });
        } else {
            yield put({
                type: GraphTypes.GET_SALES_VS_SALARY_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: GraphTypes.GET_SALES_VS_SALARY_ERROR,
            payload: { message: error?.message },
        });
    }
}

function* getAnnualTargetSummary({payload}) {
    try {
        yield put({
            type: GraphTypes.GET_ANNUAL_TARGET_SUMMARY_LOADING,
            payload: {},
        });
        const response = yield call(AnnualTargetSummaryApi,{payload} );
        if (response.data.status) {
            yield put({
                type: GraphTypes.GET_ANNUAL_TARGET_SUMMARY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: GraphTypes.GET_ANNUAL_TARGET_SUMMARY_RESET,
                payload: {  },
            });
        } else {
            yield put({
                type: GraphTypes.GET_ANNUAL_TARGET_SUMMARY_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: GraphTypes.GET_ANNUAL_TARGET_SUMMARY_ERROR,
            payload: { message: error?.message },
        });
    }
}


export function* AnnualSalarySaga(): any {
    yield takeEvery(GraphTypes.GET_ANNUAL_SALARY_SUMMARY,getAnnnualSaleSummaryReport)
}
export function* SalesVsSalarySaga(): any {
    yield takeEvery(GraphTypes.GET_SALES_VS_SALARY,getSalesVsSalaryReport)
}
export function* AnnualTargetSummarySaga(): any {
    yield takeEvery(GraphTypes.GET_ANNUAL_TARGET_SUMMARY,getAnnualTargetSummary)
}
function* AllGraphReportSaga(): any {
    yield all([
        fork(AnnualSalarySaga),
        fork(SalesVsSalarySaga),
        fork(AnnualTargetSummarySaga)
    ]);
}

export default AllGraphReportSaga;