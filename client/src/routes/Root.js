import { Navigate } from 'react-router-dom';
import { APICore } from '../helpers/api/apiCore';

const Root = () => {
    const api = new APICore();
    
    // Check if user is authenticated first
    if (!api.isUserAuthenticated()) {
        return <Navigate to="/account/login" replace />;
    }
    
    const getRootUrl = () => {
        let role = sessionStorage.getItem("role")
        if(role === "admin"){
            let url = 'admin/dashboard';
            return url;
        }
        else{
            let url = "dashboard"
            return url;
        }
    };

    const url = getRootUrl();

    return <Navigate to={`/${url}`} />;
};

export default Root;
