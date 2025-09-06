// @flow
import React,{useEffect,useState} from 'react';
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
// component
import CardTitle from '../../../components/CardTitle';

const RevenueChart = (): React$Element<any> => {
    const [graphData,setGraphData] = useState([])
    const[expenditureGraphData,setExpenditureData] = useState([])
    
    const store = useSelector((state)=>state)
    const apexLineChartWithLables = {
        chart: {
            height: 364,
            type: 'line',
            dropShadow: {
                enabled: true,
                opacity: 0.1,
                blur: 12,
                left: -12,
                top: 12,
            },
            toolbar: {
                show: false,
            },
            parentHeightOffset: 0,
        },
        grid: {
            padding: {
                left: 0,
                right: 0,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 4,
        },
        zoom: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        colors: ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00'],
        xaxis: {
            type: 'string',
            categories: expenditureGraphData?.map((ele)=>ele?.saleMnth),
            tooltip: {
                enabled: false,
            },
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return  "₹" + INR_Format(val) ;
                },
            },
        },
    };

    const apexLineChartWithLablesData = [
        {
            name: 'Sales',
            // data: [10, 20, 15, 25, 2000000000, 30, 20,30,10,30,40,30],
            data:graphData?.map((ele)=>ele?.revenueTotalAmount)
        },
        {
            name: 'Expenditure',
            // data: [0, 15, 10, 3000000000, 15, 35, 25,30,25,40,30,20],
            data:expenditureGraphData?.map((ele)=>ele?.expenditureTotalAmount)
        },
    ];
    const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }

    useEffect(()=>{
setGraphData(store?.OverallDataReducer?.annualsalegraph?.responseData?.revenueGraphDataArr)
setExpenditureData(store?.OverallDataReducer?.annualsalegraph?.expenditureGraphDataArr)
    },[store])

    return (
        <Card className='h-100'>
            <Card.Body>
                {/* <CardTitle
                    containerClass="d-flex align-items-center justify-content-between mb-2 fw-bold"
                    title="Revenue Vs Expenditure"
                    menuItems={[
                        { label: 'Sales Report' },
                        { label: 'Export Report' },
                        { label: 'Profit' },
                        { label: 'Action' },
                    ]}
                /> */}
                      <Row>
                <Col lg={12} className='pb-2'>
                    <Row>
                     <Col lg={6}>
                     <h4 className="header-title mb-1 ">Sales Vs Expenditure</h4>
                     </Col>
                </Row>
            </Col>
            </Row>


                <div className="chart-content-bg">
                    <Row className="text-center">
                        <Col md={6}>
                            <p className="text-muted mb-0 mt-3"> Sales</p>
                            <h2 className="fw-normal text-nowrap mb-4">
                                <small className="mdi mdi-checkbox-blank-circle text-primary align-middle me-1"></small>
                                <span>₹ {store?.OverallDataReducer?.annualsalegraph?.totalRevenueAmount?INR_Format(store?.OverallDataReducer?.annualsalegraph?.totalRevenueAmount):"0"}</span>
                            </h2>
                        </Col>

                        <Col md={6}>
                            <p className="text-muted mb-0 mt-3"> Expenditure</p>
                            <h2 className="fw-normal text-nowrap mb-3">
                                <small className="mdi mdi-checkbox-blank-circle text-success align-middle me-1"></small>
                                <span>{`₹ ${store?.OverallDataReducer?.annualsalegraph?.totalExpenditureAmount?INR_Format(store?.OverallDataReducer?.annualsalegraph?.totalExpenditureAmount):"0"}`}</span>
                            </h2>
                        </Col>
                    </Row>
                </div>

                {/* <div className="dash-item-overlay d-none d-md-block">
                    <h5>Today's Earning: INR 2,562.30</h5>
                    <p className="text-muted font-13 mb-3 mt-2">
                        Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam
                        rhoncus...
                    </p>
                    <Link to="#" className="btn btn-outline-primary">
                        View Statements
                        <i className="mdi mdi-arrow-right ms-2"></i>
                    </Link>
                </div> */}

                <Chart
                    options={apexLineChartWithLables}
                    series={apexLineChartWithLablesData}
                    type="line"
                    className="apex-charts mt-3"
                    height={378}
                />
            </Card.Body>
        </Card>
    );
};

export default RevenueChart;
