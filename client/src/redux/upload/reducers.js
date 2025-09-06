import uploadTypes from "./constants";

const UploadTellyReportINITIAL_STATE = {
    loading: false,
    message:"",
    data:[]
}
const upload_second_file_initial_state={

    loading: false,
    message:""
}

export const uploadTellyReportS = (state = UploadTellyReportINITIAL_STATE, action) => {
   
    switch (action.type) {
        case uploadTypes.UPLOAD_TELLY_LOADING:
            return {
                loading: true,
            };
        case uploadTypes.UPLOAD_TELLY_SUCCESS:
            return {
                ... action?.payload,
                loading: false,
            };
        case uploadTypes.UPLOAD_TELLY_RESET:
            return UploadTellyReportINITIAL_STATE
        case uploadTypes.UPLOAD_TELLY_ERROR:
            return {
                loading: false,
                mesage:action?.payload,
                status:400
            };
        default:
            return { ...state };
    }
};
export const uploadSecondTellyFIle = (state = upload_second_file_initial_state, action) => {
   
    switch (action.type) {
        case uploadTypes.UPLOAD_SECOND_FILE_LOADING:
            return {
                loading: true,
            };
        case uploadTypes.UPLOAD_SECOND_FILE_SUCCESS:
            return {
                ... action?.payload,
                loading: false,
            };
            case uploadTypes.UPLOAD_SECOND_FILE_RESET:
                return upload_second_file_initial_state
       
        case uploadTypes.UPLOAD_SECOND_FILE_ERROR:
            return {
                loading: false,
                mesage:action?.payload,
                status:400
            };
        default:
            return { ...state };
    }
};

export const uploadSalaryFile = (state = upload_second_file_initial_state, action) => {
   
    switch (action.type) {
        case uploadTypes.UPLOAD_SALARY_FILE_LOADING:
            return {
                loading: true,
            };
        case uploadTypes.UPLOAD_SALARY_FILE_SUCCESS:
            return {
                ... action?.payload,
                loading: false,
            };
            case uploadTypes.UPLOAD_SALARY_FILE_RESET:
                return upload_second_file_initial_state
       
        case uploadTypes.UPLOAD_SALARY_FILE_ERROR:
            return {
                loading: false,
                mesage:action?.payload,
                status:400
            };
        default:
            return { ...state };
    }
};
export const uploadRateDifferenceFile = (state = upload_second_file_initial_state, action) => {
   
    switch (action.type) {
        case uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_LOADING:
            return {
                loading: true,
            };
        case uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_SUCCESS:
            return {
                ... action?.payload,
                loading: false,
            };
            case uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_RESET:
                return upload_second_file_initial_state
       
        case uploadTypes.UPLOAD_RATE_DIFFERENCE_FILE_ERROR:
            return {
                loading: false,
                mesage:action?.payload,
                status:400
            };
        default:
            return { ...state };
    }
};