import React,{useEffect} from 'react'
import Central from './ZoneReport/Central';
import North from './ZoneReport/North';
import East from './ZoneReport/East';
import West from './ZoneReport/West';
import South from './ZoneReport/South';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table ,Col,Button,Row} from 'react-bootstrap';
import '../../../../style.css';
import MainLoader from '../../../../components/MainLoader';
import { getCentralZoneReportAction, getEastZoneReportAction, getNorthZoneReportAction, getSouthZoneReportAction, getWestZoneReportAction } from '../../../../redux/actions';
function SaleExecutiveReport(){
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const loaderHandel = store?.NorthZoneReportReducer;
  useEffect(() => {
    dispatch(getNorthZoneReportAction());
    dispatch(getSouthZoneReportAction());
    dispatch(getEastZoneReportAction());
    dispatch(getWestZoneReportAction());
    dispatch(getCentralZoneReportAction());
}, []);

return( 
    <>
   {loaderHandel?.loading?<MainLoader/>:(
    <>

    <North/>
    <South/>
    <East/>
    <West/>
  <Central/>
  </>)}
    </>
)
}
export default SaleExecutiveReport