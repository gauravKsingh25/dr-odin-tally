export const MONTH_API = "/month/get"

export const LIST_DESIGNATION = "/designation/get?"
export const CREATE_EMPLOYEE = "/empinfo/create"
export const GET_EMPLOYEE = "/empinfo/allemp"
export const UPDATE_EMPLOYEE = "empinfo/update/ae39"
export const GET_ZONES = "/empinfo/getzone"
export const GET_TOTALMONTH_SALE = "/total/monthsale"
export const GET_TOTAL_EXPENDITURE = "/total/expenditure?currentMonth=1"
export const GET_MONTH_EXPENDITURE = "/total/monthExpenditure"
export const GET_TARGET_ACHIEVED = "/total/targetAchieved"

// upload
export const SECOND_TELLY_FILE_UPLOAD = "/tally/create"
export const TELLY_REPORT_UPLOAD = "/credit/create"
export const UPLOAD_SALARY_REPORT = "/salary/insert"
export const UPLOAD_RATE_DIFFERENCE_REPORT = "/tally/rateDifference"


export const GET_REPORTING_MANAGER_BY_DESIGNATION = "/empinfo/get?"
export const CREATE_STATE = "/designation/createState"
export const GET_STATE = "/designation/getState"
// delet state api 
export const DELETE_STATE = "/designation/DeleteState?id="
export const ADD_CITY = "/designation/createCity"
export const getCity = "/designation/getCity"
//  delete city api 
export const DELETE_CITY = "/designation/DeleteCity?id="
export const CREATE_DESIGNATION = "/designation/insert"
// delete designation api 
export const DELETE_DESIGNATION = "/designation/deldesignation?id="
export const GET_PRODUCT_WISE_REPORT = "/products/list"
export const UPDATE_STATE = "/designation/stateUpdate"
export const UPDATE_DESIGNATION = "/designation/desUpdate"
export const GET_ANNUAL_SALE_GRAPH = "/total/annualSales?currentMonth=1"


// overall graph api 
export const OVERALL_API = "/total/overallsale"
// SALE EXECUTIVE REPORTS
export const GET_SALE_EXECUTIVE_REPORT = "/saleExecutive/report"
// Revenue by location
export const GET_REVENUE_BY_LOCATION = "/total/zonerevenue"
// Create Projection
export const CREATE_PROJECTION = "/total/create/companytrgt"
// Get projection in list
export const GET_PROJECTION = "/total/monthlytrgtAmt"
// update city api 
export const UPDATE_CITY = "/designation/updateCity"
// Update Projection
export const UPDATE_PROJECTION = "/total/update/companytrgt"
// Get north zone report
export const GET_NORTH_ZONE_REPORT = "/saleExecutive/northZone"
// Get South zone report
export const GET_SOUTH_ZONE_REPORT = "/saleExecutive/southZone"
// Get East zone report
export const GET_EAST_ZONE_REPORT = "/saleExecutive/eastZone"
// Get West zone report
export const GET_WEST_ZONE_REPORT = "/saleExecutive/westZone"
// Get Central zone report
export const GET_CENTRAL_ZONE_REPORT = "/saleExecutive/centralZone"

// get filter product data 
export const FILTER_PRODUCT_REPORT = "/total/filterProductData"
//
// getCitybyState
export const GET_CITY_BY_STATE = "/designation/GetStateCity?stateId"

//getstatebyzone
export const GET_STATE_BY_ZONE = "/designation/GetZoneState?zoneId"
// create zone 
export const CREATE_ZONE = "/empinfo/createZone"
// get zone
export const GET_ZONE = "/empinfo/getzone"
//  Update Zone
export const UPDATE_ZONE = "/empinfo/updatezone"

// get Annual sale summary  
export const ANNUAL_SALE_SUMMARY = "/total/annualSaleSummary?currentMonth="

// get Annual Sales VS salary api 

export const GET_SALES_VS_SALARY = "/total/sales_salary?currentMonth="
// Delete Zone
export const DELETE_ZONE = "/empinfo/delzone/"

// get annual target summary api 

export const ANNUAL_TARGET_SUMMARY = "/total/annualtrgtSummary?currentMonth="

// get full months 

export const GET_FULL_MONTHS = "/empinfo/getmonth"


// add month target  

export const ADD_MONTHS_TARGET = "/empinfo/createMtarget"
// get vendor data
export const GET_VENDOR_REPORT = "/product/vendors"
// get bde list 
export const GET_BDE_LIST = "/saleExecutive/Zonebde?managerId="
// get all product detail
export const GET_PRODUCT_DETAIL_REPORT = "/product/getByName?pid="
// gett all vendor detail
export const GET_VENDOR_DETAIL_REPORT = "/vendor/getByName?vid="
// create Company
export const CREATE_COMPANY = "/company/create"
export const COMPANY_LIST = "/company/view?active="
export const COMPANY_STATUS = "/company/update"
