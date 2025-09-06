import MonthtActionTypes from './constants';
const MONTH_LIST_INITIAL_STATE = {
    MonthList: [],
    loading: false,
};

// start month List
 export const MonthListReducer = (state = MONTH_LIST_INITIAL_STATE, action) => {
    switch (action.type) {
        case MonthtActionTypes.MONTH_LIST_LOADING:
            return {
                MonthList: state.MonthList,
                loading: true,
            };
        case MonthtActionTypes.MONTH_LIST_SUCCESS:
            return {
                MonthList: action?.payload,
                loading: false,
            };
        case MonthtActionTypes.MONTH_LIST_ERROR:
            return {
                MonthList: state.MonthList,
                loading: false,
            };
        default:
            return { ...state }; 
    }
};
// end month List
