
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';


import StatisticsWidget from '../../../components/StatisticsWidget';

const Statistics = (): React$Element<React$FragmentType> => {
    const store = useSelector((state)=>state)
    const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    return (
        <>
            <Row className='pb-3'>
                <Col lg={6}>
                    <StatisticsWidget 
                        icon="mdi mdi-account-multiple"
                        description="Total Sale "
                        title="Total  Sale"
                        stats={`₹${store?.TotalMonthSaleReducer?.totalMonthSale?.response?.currMonth?INR_Format(store?.TotalMonthSaleReducer?.totalMonthSale?.response?.currMonth):"0"}`}
                        trend={{
                            textClass: store?.TotalMonthSaleReducer?.totalMonthSale?.response?.sign==="increase"?'text-success':"text-danger",
                            icon:store?.TotalMonthSaleReducer?.totalMonthSale?.response?.sign==="increase"? 'mdi mdi-arrow-up-bold':"mdi mdi-arrow-down-bold",
                            value:store?.TotalMonthSaleReducer?.totalMonthSale?.response?.difference? store?.TotalMonthSaleReducer?.totalMonthSale?.response?.difference + "%":"0 %",
                            time: 'Since last month',
                        }}
                        ></StatisticsWidget>
                </Col>

                <Col className='mt-3 mt-md-0' lg={6}>
                    <StatisticsWidget
                        icon=" uil-file-minus-alt"
                        description="Total Products"
                        title="Total Products"
                        stats={`${store?.ProductReportReducer?.productreport?.productsCount?store?.ProductReportReducer?.productreport?.productsCount:"0"} Products`}
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

            <Row className='pb-3'>
                <Col lg={6}>
                    <StatisticsWidget
                        icon="mdi mdi-currency-usd"
                        description="Expenditure "
                        title=" Expenditure"
                        stats={`₹${store?.MonthExpenditureReducer?.monthexpenditure?.response?.currMonth?INR_Format(store?.MonthExpenditureReducer?.monthexpenditure?.response?.currMonth):"0"}`}
                        trend={{
                            textClass:store?.MonthExpenditureReducer?.monthexpenditure?.response?.sign=="increase"?"text-success": 'text-danger',
                            icon: store?.MonthExpenditureReducer?.monthexpenditure?.response?.sign=="increase"?"mdi mdi-arrow-up-bold":'mdi mdi-arrow-down-bold',
                            value:store?.MonthExpenditureReducer?.monthexpenditure?.response?.difference?store?.MonthExpenditureReducer?.monthexpenditure?.response?.difference + "%" : "0%" ,
                            time: 'Since last month',
                        }}
                        ></StatisticsWidget>
                </Col>

                <Col className='mt-3 mt-md-0'  lg={6}>
                    <StatisticsWidget
                        icon="mdi mdi-pulse"
                        description="Target Achieved"
                        title="Target Achieved"
                        stats={store?.TargetAchievedReducer?.targetachieved?.response?.currMonth?store?.TargetAchievedReducer?.targetachieved?.response?.currMonth + "%":"0%"}
                        trend={{
                            textClass: store?.TargetAchievedReducer?.targetachieved?.response?.sign=="increase"?'text-success':"text-danger",
                            icon: store?.TargetAchievedReducer?.targetachieved?.response?.sign=="increase"?'mdi mdi-arrow-up-bold':"mdi mdi-arrow-down-bold",
                            value: store?.TargetAchievedReducer?.targetachieved?.response?.difference?store?.TargetAchievedReducer?.targetachieved?.response?.difference + "%":"0%",
                            time: 'Since last month',
                        }}
                        ></StatisticsWidget>
                </Col>
                
            </Row>
            {/* <Row>
                <Col sm={6}>
                    <StatisticsWidget
                        icon="mdi mdi-currency-usd"
                        description="Total Employee"
                        title="Total Employee"
                        stats="254514"
                        trend={{
                            textClass: 'text-danger',
                            icon: 'mdi mdi-arrow-down-bold',
                            value: '7.00%',
                            time: 'Since last month',
                        }}
                        ></StatisticsWidget>
                </Col>

                <Col sm={6}>
                    <StatisticsWidget
                        icon="mdi mdi-pulse"
                        description="Total Sale"
                        title="Total Sale"
                        stats="50%"
                        trend={{
                            textClass: 'text-success',
                            icon: 'mdi mdi-arrow-up-bold',
                            value: '4.87%',
                            time: 'Since last month',
                        }}
                        ></StatisticsWidget>
                </Col>
                
            </Row> */}
        </>
    );
};

export default Statistics;
