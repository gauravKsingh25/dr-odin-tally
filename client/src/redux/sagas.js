// @flow
import { all } from 'redux-saga/effects';

import authSaga from './auth/saga';
import layoutSaga from './layout/saga';
import monthListSaga from './month/saga';
import getDesignationSaga from './addEmployee/saga';
import activeEmployeeSaga from './staffManagment/activeEmployee/saga';
import uploadTellyReportSaga from './upload/saga';
import totalMonthSale from "./dashboard/saga"
import stateCreateSaga from './setting/saga';
import AllGraphReportSaga from './Annual/saga';
import AdminSaga from './Admin/saga';


export default function* rootSaga(): any {
    yield all([authSaga(),
         layoutSaga(),
         monthListSaga(),
         getDesignationSaga(),
         activeEmployeeSaga(),
         uploadTellyReportSaga(),
         totalMonthSale(),
         stateCreateSaga(),
         AllGraphReportSaga(),
         AdminSaga()
        ]);
}
