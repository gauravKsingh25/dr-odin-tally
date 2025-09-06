import MonthtActionTypes from "./constants"

type AuthAction = { type: string, payload: {} | string };

// start expenses report List
export const MonthList = (data): AuthAction => ({
    type: MonthtActionTypes.GET_MONTH_LIST,
    payload: data 
})