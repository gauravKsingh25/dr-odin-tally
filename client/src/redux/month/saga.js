import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import MonthtActionTypes from './constants';
import { getMonth } from './api';

// start month List
function* MonthList() {
    try {
        yield put({
            type: MonthtActionTypes.MONTH_LIST_LOADING,
            payload: {},
        });
        const response = yield call(getMonth, );
        if (response.data.status) {
            yield put({
                type: MonthtActionTypes.MONTH_LIST_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: MonthtActionTypes.MONTH_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: MonthtActionTypes.MONTH_LIST_ERROR,
            payload: { message: error.message },
        });
    }
}
// end month List


export function* getMonthtList(): any {
    yield takeEvery(MonthtActionTypes.GET_MONTH_LIST, MonthList);
}

function* monthListSaga(): any {
    yield all([
        fork(getMonthtList),
    ]);
}

export default monthListSaga;
