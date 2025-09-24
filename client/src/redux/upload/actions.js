import uploadTypes from "./constants";

// start expenses report List
export const UploadTellyReportPOST = (data) => ({
    type: uploadTypes.UPLOAD_TELLY,
    payload: data
})

export const UploadSecondReport = (data) => ({
    type : uploadTypes.UPLOAD_SECOND_FILE,
    payload: data
})

export const uploadSalaryExpanses = (data) => ({
    type:uploadTypes.UPLOAD_SALARY_FILE,
    payload: data
})
export const uploadRateDifference = (data) => ({
    type:uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE,
    payload: data
})

// Voucher Excel Upload
export const uploadVoucherExcel = (data) => ({
    type: uploadTypes.UPLOAD_VOUCHER_EXCEL,
    payload: data
})

export const resetVoucherUpload = () => ({
    type: uploadTypes.UPLOAD_VOUCHER_EXCEL_RESET,
    payload: {}
})