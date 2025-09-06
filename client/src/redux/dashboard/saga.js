import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import TotalMonthSaleActionTypes from './constant';
import { getTotalMonthSaleApi,getTotalExpenditureApi,getfilterProductDataApi, getMonthExpenditureApi, getTargetAchievedApi, getProductWiseApi, getAnnualSaleGraphApi,getOverAllGraphApi, getSaleExecutiveReportApi, getRevenueByLocationApi, getNorthZoneReportApi, getSouthZoneReportApi, getEastZoneReportApi, getWestZoneReportApi, getCentalZoneReportApi, getVendorReportApi, BdeListApi, getProductDetailReportApi, getVendorCSVReportApi, getVendorDetailReportApi } from './api';

// total month sale
function* totalMonthSale({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.TOTALMONTH_SALE_LOADING,
            payload: {},
        });
        const response = yield call(getTotalMonthSaleApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.TOTALMONTH_SALE_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.TOTALMONTH_SALE_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.TOTALMONTH_SALE_ERROR,
            payload: { message: error?.message },
        });
    }
}
// total expenditure
function* totalExpenditure() {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.TOTAL_EXPENDITURE_LOADING,
            payload: {},
        });
        const response = yield call(getTotalExpenditureApi,{} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.TOTAL_EXPENDITURE_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.TOTAL_EXPENDITURE_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.TOTAL_EXPENDITURE_ERROR,
            payload: { message: "server issue" },
        });
    }
}
// month expenditure
function* monthExpenditure({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.MONTH_EXPENDITURE_LOADING,
            payload: {},
        });
        const response = yield call(getMonthExpenditureApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.MONTH_EXPENDITURE_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.MONTH_EXPENDITURE_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.MONTH_EXPENDITURE_ERROR,
            payload: { message: error?.message },
        });
    }
}
// month expenditure
function* targetAchieved({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.TARGET_ACHIEVED_LOADING,
            payload: {},
        });
        const response = yield call(getTargetAchievedApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.TARGET_ACHIEVED_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.TARGET_ACHIEVED_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
    
        yield put({
            type: TotalMonthSaleActionTypes.TARGET_ACHIEVED_ERROR,
            payload: { message: error?.message },
        });
    }
}
// Product Wise Report
function* productWiseReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getProductWiseApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_ERROR,
            payload: { message: "server error" },
        });
    }
}
function* productWiseCSVReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_LOADING,
            payload: {},
        });
        const response = yield call(getProductWiseApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_SUCESS,
                payload: { ...response.data,nextstatus:2000 },
            });
            yield put({
                type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_RESET,
                payload: {  },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.PRODUCT_WISE_REPORT_CSV_ERROR,
            payload: { message: "server error" },
        });
    }
}
// Vendor Report
function* VendorReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA_LOADING,
            payload: {},
        });
        const response = yield call(getVendorReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA_ERROR,
            payload: { message: "server error" },
        });
    }
}
function* VendorReportCSV({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_LOADING,
            payload: {},
        });
        const response = yield call(getVendorCSVReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_ERROR,
            payload: { message: "server error" },
        });
    }
}
function* annualSaleGraph({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH_LOADING,
            payload: {},
        });
        const response = yield call(getAnnualSaleGraphApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH_SUCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* overAllGraphData({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_OVERALL_DATA_LOADING,
            payload: {},
        });
        const response = yield call(getOverAllGraphApi );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_OVERALL_DATA_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_OVERALL_DATA_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_OVERALL_DATA_ERROR,
            payload: { message: error?.message },
        });
    }
}
// Sale Executive Report
function* saleExecutiveReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getSaleExecutiveReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT_ERROR,
            payload: { message: "server error" },
        });
    }
}
// Revenue by location
function* revenueByLocation({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION_LOADING,
            payload: {},
        });
        const response = yield call(getRevenueByLocationApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION_ERROR,
            payload: { message: error?.message },
        });
    }
}
// north zone report
function* northZoneReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getNorthZoneReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}
// south zone report
function* southZoneReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getSouthZoneReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}
// east zone report
function* eastZoneReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getEastZoneReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}
// west zone report
function* westZoneReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getWestZoneReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}
// central zone report
function* centralZoneReport({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getCentalZoneReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}

// bde list
function* Bdelist({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_LIST_RESET,
            payload: {},
        });
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_LIST_LOADING,
            payload: {},
        });
        const response = yield call(BdeListApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_LIST_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_LIST_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* BdeSouthlist({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_RESET,
            payload: {},
        });
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_LOADING,
            payload: {},
        });
        const response = yield call(BdeListApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* BdeEastlist({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_RESET,
            payload: {},
        });
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_LOADING,
            payload: {},
        });
        const response = yield call(BdeListApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_EAST_LIST_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* BdeWestlist({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_RESET,
            payload: {},
        });
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_LOADING,
            payload: {},
        });
        const response = yield call(BdeListApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_WEST_LIST_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* BdeCenterlist({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_RESET,
            payload: {},
        });
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_LOADING,
            payload: {},
        });
        const response = yield call(BdeListApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* getFilterProductData({payload}){
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA_LOADING,
            payload: {},
        });
        const response = yield call(getfilterProductDataApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* getProductDetail({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getProductDetailReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_RESET,
            //     payload: {  },
            // });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}
function* getVendorDetail({payload}) {
    try {
        yield put({
            type: TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_LOADING,
            payload: {},
        });
        const response = yield call(getVendorDetailReportApi,{payload} );
        if (response.data.status) {
            yield put({
                type: TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT_ERROR,
            payload: { message: error?.message },
        });
    }
}

export function* getTotalMonthSale(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_TOTALMONTH_SALE, totalMonthSale);
}
export function* getTotalExpenditure(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_TOTAL_EXPENDITURE, totalExpenditure);
}
export function* getMonthExpenditure(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_MONTH_EXPENDITURE, monthExpenditure);
}
export function* getTargetAchieved(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_TARGET_ACHIEVED, targetAchieved);
}
export function* getproductWiseReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_PRODUCT_WISE_REPORT, productWiseReport);
}
export function* getproductWiseCSVReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_PRODUCT_WISE_CSV_REPORT, productWiseCSVReport);
}
export function* getVendorReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_VENDOR_REPORT_DATA, VendorReport); 
}
export function* getVendorCSVReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_VENDOR_REPORT_CSV_REPORT, VendorReportCSV); 
}
export function* getAnnualSaleGraph(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_ANNUAL_SALE_GRAPH, annualSaleGraph);
}
export function* getOverAllGraphData(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_OVERALL_DATA,overAllGraphData)
}
export function* getSaleExecutiveReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_SALE_EXECUTIVE_REPORT,saleExecutiveReport)
}
export function* getRevenueByLocation(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_REVENUE_BY_LOCATION,revenueByLocation)
}
export function* getNorthZoneReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_NORTH_ZONE_REPORT,northZoneReport)
}
export function* getSouthZoneReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_SOUTH_ZONE_REPORT,southZoneReport)
}
export function* getEastZoneReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_EAST_ZONE_REPORT,eastZoneReport)
}
export function* getWestZoneReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_WEST_ZONE_REPORT,westZoneReport)
}
export function* getCentralZoneReport(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_CENTRAL_ZONE_REPORT,centralZoneReport)
}
export function* getBdeList(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_BDE_LIST,Bdelist)
}
export function* getBdeSouthList(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_BDE_SOUTH_LIST,BdeSouthlist)
}
export function* getBdeEastList(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_BDE_EAST_LIST,BdeEastlist)
}
export function* getBdeWestList(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_BDE_WEST_LIST,BdeWestlist)
}
export function* getBdeCenterList(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_BDE_CENTER_LIST,BdeCenterlist)
}

export function* getFilterProductDataSaga(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_FILTER_PRODUCT_DATA,getFilterProductData)
}
export function* getProductDetailSaga(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_PRODUCT_DETAIL_REPORT,getProductDetail)
}
export function* getVendorDetailSaga(): any {
    yield takeEvery(TotalMonthSaleActionTypes.GET_VENDOR_DETAIL_REPORT,getVendorDetail)
}
function* totalMonthSaleSaga(): any {
    yield all([
        fork(getTotalMonthSale),
        fork(getTotalExpenditure),
        fork(getMonthExpenditure),
        fork(getTargetAchieved),
        fork(getproductWiseReport),
        fork(getproductWiseCSVReport),
        fork(getVendorReport),
        fork(getVendorCSVReport),
        fork(getAnnualSaleGraph),
        fork(getOverAllGraphData),
        fork(getSaleExecutiveReport),
        fork(getRevenueByLocation),
        fork(getNorthZoneReport),
        fork(getSouthZoneReport),
        fork(getEastZoneReport),
        fork(getWestZoneReport),
        fork(getCentralZoneReport),
        fork(getBdeList),
        fork(getBdeSouthList),
        fork(getBdeEastList),
        fork(getBdeWestList),
        fork(getBdeCenterList),
        fork(getFilterProductDataSaga),
        fork(getProductDetailSaga),
        fork(getVendorDetailSaga),
    ]);
}

export default totalMonthSaleSaga;