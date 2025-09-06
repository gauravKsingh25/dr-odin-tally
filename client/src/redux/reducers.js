// @flow
import { combineReducers } from 'redux';

import Auth from './auth/reducers';
import Layout from './layout/reducers';
import {MonthListReducer} from './month/reducers';
import { GetDesignationReducer,getZoneListReducer } from './addEmployee/reducers';
import { uploadTellyReportS,uploadSecondTellyFIle,uploadSalaryFile,uploadRateDifferenceFile } from './upload/reducers';
import { StateCreateReducer,getStateReducer ,createCityReducer,getCityReducer,InsertDesignationReducer,UpdateStateReducer,UpdateDesignationReducer,CreateProjectionReducer,GetProjectionReducer,UpdateProjectionReducer,UpdateCityReducer,deleteDesignationReducer,deleteCityReducer,
   getZoneReducer ,deleteStateReducer,createZoneReducer,getCityByState,deleteZoneReducer,getStateByZoneReducer,UpdateZoneReducer,getFullMonthReucer,addMonthTaregtReducer} from './setting/reducers';
import {TotalMonthSaleReducer,TotalExpenditureReducer,MonthExpenditureReducer,TargetAchievedReducer,ProductReportReducer,AnnualSaleGraphReducer,OverallDataReducer,SaleExecutiveReportReducer,RevenueByLocationtReducer,NorthZoneReportReducer,
    SouthZoneReportReducer,EastZoneReportReducer,WestZoneReportReducer,CentralZoneReportReducer,VendorListReducer,BdeListReducer,BdeSouthListReducer,BdeEastListReducer,BdeWestListReducer,BdeCenterListReducer,ProductCSVReportReducer,productDetailReportReducer ,
    vendorCSVReducer,VendorDetailReportReducer,} from "./dashboard/reducers"
import {ActiveEmployeeListReducer,ActiveEmployeeCreateReducer,ActiveEmployeeUpdateReducer,ReportingManagerByDesignationReducer } from './staffManagment/activeEmployee/reducers';
import { annualSaleSummaryReducer,annualSalesVsSalary ,annualTargetSummaryReducer} from './Annual/reducers';
import { companyCreateReducer ,getCompanyListReducer,companyStatusReducer} from './Admin/reducers';
export default (combineReducers({

    Auth,
    Layout,
    MonthListReducer,
    companyStatusReducer,
    getCompanyListReducer,
    companyCreateReducer,
    productDetailReportReducer,
    VendorDetailReportReducer,
    GetDesignationReducer,
    ActiveEmployeeCreateReducer,
    uploadTellyReportS,
    uploadRateDifferenceFile,
    uploadSecondTellyFIle,
    getZoneListReducer,
    ActiveEmployeeListReducer,
    ActiveEmployeeUpdateReducer,
    TotalMonthSaleReducer,
    TotalExpenditureReducer,
    MonthExpenditureReducer,
    TargetAchievedReducer,
   ReportingManagerByDesignationReducer,
    StateCreateReducer,
    getStateReducer,
    createCityReducer,
    getCityReducer,
    InsertDesignationReducer,
    ProductReportReducer,VendorListReducer,
    UpdateStateReducer,
    UpdateDesignationReducer,
    AnnualSaleGraphReducer,
    OverallDataReducer,
    SaleExecutiveReportReducer,
    RevenueByLocationtReducer,
    CreateProjectionReducer,
    GetProjectionReducer,
    UpdateCityReducer,
    UpdateProjectionReducer,
    uploadSalaryFile,
    deleteDesignationReducer,
    deleteCityReducer,
    deleteStateReducer,
    NorthZoneReportReducer,SouthZoneReportReducer,EastZoneReportReducer,WestZoneReportReducer,WestZoneReportReducer,BdeListReducer,
    CentralZoneReportReducer,
    getCityByState,
    getStateByZoneReducer,
    createZoneReducer,
    getZoneReducer,
    UpdateZoneReducer,
    vendorCSVReducer,
    annualSaleSummaryReducer,
    annualSalesVsSalary,
    annualTargetSummaryReducer,
    deleteZoneReducer,
    getFullMonthReucer,
    addMonthTaregtReducer,
    BdeSouthListReducer,
    BdeEastListReducer,
    BdeWestListReducer,
    BdeCenterListReducer,
    ProductCSVReportReducer

  
    

}): any);
