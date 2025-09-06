import React from 'react'
import {useEffect,useState} from 'react'
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import StatisticsWidget from '../../../components/StatisticsWidget';
import { companyListAction } from '../../../redux/actions';


function Dashboard() {
  const [active, setActive] = useState(1)
const dispatch = useDispatch();
  const store = useSelector((state) => state)
  useEffect(() => {
    dispatch(companyListAction(active))
  }, [])
  return (
   <>
     <Row className='pb-3 py-3'>
                <Col lg={6}>
                    <StatisticsWidget 
                        icon="uil-graph-bar"
                        description="Total Companies "
                        title="Total Companies"
                        stats={store?.getCompanyListReducer?.data?.companyCount}
                        // trend={{
                        //     textClass: store?.TotalMonthSaleReducer?.totalMonthSale?.response?.sign==="increase"?'text-success':"text-danger",
                        //     icon:store?.TotalMonthSaleReducer?.totalMonthSale?.response?.sign==="increase"? 'mdi mdi-arrow-up-bold':"mdi mdi-arrow-down-bold",
                        //     value:store?.TotalMonthSaleReducer?.totalMonthSale?.response?.difference? store?.TotalMonthSaleReducer?.totalMonthSale?.response?.difference + "%":"0 %",
                        //     time: 'Since last month',
                        // }}
                        ></StatisticsWidget>
                </Col>

                <Col className='mt-3 mt-md-0' lg={6}>
                    <StatisticsWidget
                        icon=" uil-graph-bar"
                        description="Active Companies"
                        title="Active Companies"
                        stats={store?.getCompanyListReducer?.data?.activeCount}
                        
                        // trend={{
                        //     textClass:store?.TotalExpenditureReducer?.totalexpenditure?.response?.sign=="increase"?"text-success": 'text-danger',
                        //     icon:store?.TotalExpenditureReducer?.totalexpenditure?.response?.sign=="increase" ?"mdi mdi-arrow-up-bold":'mdi mdi-arrow-down-bold',
                        //     value: store?.TotalExpenditureReducer?.totalexpenditure?.response?.difference?store?.TotalExpenditureReducer?.totalexpenditure?.response?.difference + "%":"0 %",
                        //     time: 'Since last month',
                        // }}
                        >
                     </StatisticsWidget>
                </Col>
            </Row>
   </>
  )
}

export default Dashboard