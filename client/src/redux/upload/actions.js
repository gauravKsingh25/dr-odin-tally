import uploadTypes from "./constants";

type AuthAction = { type: string, payload: {} | string };

// start expenses report List
export const UploadTellyReportPOST = (data): AuthAction => ({
    type: uploadTypes.UPLOAD_TELLY,
    payload: data
})

export const UploadSecondReport = (data): AuthAction => ({
    type : uploadTypes.UPLOAD_SECOND_FILE,
    payload: data
})

export const uploadSalaryExpanses = (data): AuthAction => ({
    type:uploadTypes.UPLOAD_SALARY_FILE,
    payload: data
})
export const uploadRateDifference = (data): AuthAction => ({
    type:uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE,
    payload: data
})