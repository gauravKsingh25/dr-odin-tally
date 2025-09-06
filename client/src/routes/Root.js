import { Navigate } from 'react-router-dom';

const Root = () => {
    const getRootUrl = () => {
        let role = sessionStorage.getItem("role")
        if(role=="admin"){

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
