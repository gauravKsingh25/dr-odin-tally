// @flow
import { all, fork, put, takeEvery, call } from 'redux-saga/effects';

import {
    login as loginApi,
    logout as logoutApi,
    signup as signupApi,
    forgotPassword as forgotPasswordApi,
    forgotPasswordConfirm,
    
} from '../../helpers/';
import { adminLogin } from '../../helpers/api/auth';

import { APICore, setAuthorization } from '../../helpers/api/apiCore';
import { authApiResponseSuccess, authApiResponseError } from './actions';
import { AuthActionTypes } from './constants';

const api = new APICore();

/**
 * Login the user
 * @param {*} payload - username and password
 */
function* login({ payload: { username, password ,role} }) {


    if(role==="admin"){
       
    try {
        let response = yield call(adminLogin, { username, password });
        let user = response.data;
        if(user?.status==200){
            let userData = {
                firstName:"Test",
                id:1,
                lastName:"User",
                password:"password",
                role:"Admin",
                token:user.accessToken,
                username:"test"
            }
       
        api.setLoggedInUser(userData);
        if(role=="admin"){
            sessionStorage.setItem("role","admin")
        }
        else{
            sessionStorage.setItem("role","ewuh")
        }
        setAuthorization(user['accessToken']);
        yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, userData));
    }
    else{
        yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, response?.data?.message));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, error));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
}
else{
    try {
        let response = yield call(loginApi, { username, password });
        let user = response.data;
        if(user.status==200){
            let userData = {
                firstName:"Test",
                id:1,
                lastName:"User",
                password:"password",
                role:"Admin",
                token:user.accessToken,
                username:"test"
            }
            api.setLoggedInUser(userData);
        
        
            sessionStorage.setItem("role","company")
        
        setAuthorization(user['accessToken']);
        yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, userData));
        }
        else if(user.status!==200){
            yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, response?.data?.message));
            api.setLoggedInUser(null);
            setAuthorization(null);

        }
        // NOTE - You can change this according to response format from your api
        
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, error));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
}
}

/**
 * Logout the user
 */
function* logout() {
    try {
        yield call(logoutApi);
        api.setLoggedInUser(null);
        setAuthorization(null);
        yield put(authApiResponseSuccess(AuthActionTypes.LOGOUT_USER, {}));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.LOGOUT_USER, error));
    }
}

function* signup({ payload: { fullname, email, password } }) {
    try {
        const response = yield call(signupApi, { fullname, email, password });
        const user = response.data;
        // api.setLoggedInUser(user);
        // setAuthorization(user['token']);
        yield put(authApiResponseSuccess(AuthActionTypes.SIGNUP_USER, user));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.SIGNUP_USER, error));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
}

function* forgotPassword({ payload: { username } }) {
    try {
        const response = yield call(forgotPasswordApi, { username });
        yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD, response.data));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD, error));
    }
}

function* forgotPasswordChange({ payload: { data } }) {
    try {
        const response = yield call(forgotPasswordConfirm, data);
        yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD_CHANGE, response.data));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD_CHANGE, error));
    }
}

export function* watchLoginUser(): any {
    yield takeEvery(AuthActionTypes.LOGIN_USER, login);
}

export function* watchLogout(): any {
    yield takeEvery(AuthActionTypes.LOGOUT_USER, logout);
}

export function* watchSignup(): any {
    yield takeEvery(AuthActionTypes.SIGNUP_USER, signup);
}

export function* watchForgotPassword(): any {
    yield takeEvery(AuthActionTypes.FORGOT_PASSWORD, forgotPassword);
}

export function* watchForgotPasswordChange(): any {
    yield takeEvery(AuthActionTypes.FORGOT_PASSWORD_CHANGE, forgotPasswordChange);
}

function* authSaga(): any {
    yield all([
        fork(watchLoginUser),
        fork(watchLogout),
        fork(watchSignup),
        fork(watchForgotPassword),
        fork(watchForgotPasswordChange),
    ]);
}

export default authSaga;
