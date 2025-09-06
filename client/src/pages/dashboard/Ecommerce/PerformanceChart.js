// @flow
import React,{useEffect,useState} from 'react';
import Chart from 'react-apexcharts';
import { Card,Col,Row } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { annualSaleGraphAction } from '../../../redux/dashboard/actions';
import { useDispatch,useSelector } from 'react-redux';
import MainLoader from '../../../components/MainLoader';

// component
import CardTitle from '../../../components/CardTitle';

const PerformanceChart = (): React$Element<any> => {
    const dispatch = useDispatch()
    const store = useSelector((state)=>state)
    const[graphData,setGraphData] = useState([])
    const [projection,setProjection ] = useState([])
    const annualSaleGraphLoader = store?.AnnualSaleGraphReducer
    let indexColour=0
   
    let cureentAmountColour=0
    const apexBarChartData = [
        {
            name: 'Actual',
            // data: [65, 59, 80, 650, 56, 89, 40, 32, 65, 59, 80, 81],
            data: graphData?.map((ele)=>ele?.revenue)
        },
        {
            name: 'Target',
            // data: [89, 40, 320, 700, 59, 80, 81, 56, 89, 40, 65, 59],
            data:graphData?.map((ele)=>ele?.mnthtrgt[0])
        },
    ];
    const apexBarChartOpts = {
       chart: {
            height: 100,
            type: 'bar',
            stacked: true,
            parentHeightOffset: 0,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '20%',
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: -6,
            colors: ['transparent'],
        },
        zoom: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        // fill: {
        //     colors: ['#F44336', '#E91E63', '#9C27B0']
        //   },
        // function({ value, seriesIndex, w ,l}) {
        //     if (value > apexBarChartData[1]?.data[cureentAmountColour]) {
        //         cureentAmountColour=cureentAmountColour+1
        //       return '#39afd1'
        //     } else {
        //         cureentAmountColour=cureentAmountColour+1
        //       return  "#727cf5"
        //     }
         
            
        //   }

        colors:[ "#727cf5",function({ value, seriesIndex, w ,l}) {
            if (value < apexBarChartData[0]?.data[indexColour]) {
                indexColour=indexColour+1
              return '#39afd1'
            } else {
                indexColour=indexColour+1
              return  "#e3eaef"
            }
         
            
          }
],

        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            // categories:graphData?.map((ele)=>ele?.saleMnth),
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return "₹"+ INR_Format(val);
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "₹"+ INR_Format(val) ;
                },
            },
        },
    };

   
    const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    useEffect(()=>{
        setGraphData(store?.AnnualSaleGraphReducer?.annualsalegraph?.response)
        // setProjection(store?.AnnualSaleGraphReducer?.annualsalegraph?.projectionData)
    },[store])
    return (
        <Card className="card-h-100 ">
   {annualSaleGraphLoader ?.loading ? 
    <div className='d-flex justify-content-center align-items-center my-auto'>
   <MainLoader/>
   </div>:          <Card.Body>
   
            
                {/* <CardTitle
                    containerClass="d-flex align-items-center justify-content-between mb-2 mt-1"
                    title="Projections Vs Actuals"
                    
                    menuItems={[
                        { label: 'Sales Report' },
                        { label: 'Export Report' },
                        { label: 'Profit' },
                        { label: 'Action' },
                    ]}     
                /> */}
                <Row>
                <Col lg={12} md={12} sm={12} xs={12} className='pb-2'>
                    <Row>
                     <Col lg={6} md={8} sm={8} xs={8}>
                     <h4 className="header-title mt-1 ">Target Vs Actuals</h4>
                     </Col>
                    <Col  className="text-end show-desktop"lg={6} md={4}  >
                    <Link to = "/annual-sale-graph"> <Button  className="btn btn-primary pt-0 pb-0 ps-1 pe-1">
                    <i className="dripicons-arrow-thin-right"></i> 
                    </Button></Link>
                    </Col>
                </Row>
            </Col>
            </Row>
                <div dir="ltr">
                    <Chart
                        options={apexBarChartOpts}
                        series={apexBarChartData}
                        type="bar"
                        className="apex-charts mt-2"
                        height={300}
                        
                    />
                </div>
                                
                                
            </Card.Body>}
        </Card>
    );
};

export default PerformanceChart;
