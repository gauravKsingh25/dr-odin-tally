// @flow
import { APICore } from './apiCore';

const api = new APICore();
// const apiurl = "http://103.185.212.115:7010/api";
// account
function login(params: any): any {

    let body = {
        username: params.username,
        password: params.password
    }
    const baseUrl = '/company/login/';
    return api.create(`${baseUrl}`, body);
}
function adminLogin(params: any): any {
    const baseUrl = '/user/login';
    let body = {
        email: params.username,
        password: params.password,
    }

    return api.create(`${baseUrl}`, body);
}
function logout(): any {
    const baseUrl = '/logout/';
    return api.create(`${baseUrl}`, {});
}

function signup(params: any): any {
    const baseUrl = '/register/';
    return api.create(`${baseUrl}`, params);
}

function forgotPassword(params: any): any {
    const baseUrl = '/forget-password/';
    return api.create(`${baseUrl}`, params);
}

function forgotPasswordConfirm(params: any): any {
    const baseUrl = '/password/reset/confirm/';
    return api.create(`${baseUrl}`, params);
}

export { login, logout, signup, forgotPassword, adminLogin, forgotPasswordConfirm };
