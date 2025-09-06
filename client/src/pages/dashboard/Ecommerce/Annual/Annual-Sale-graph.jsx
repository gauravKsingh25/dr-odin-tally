import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Chart from 'react-apexcharts';
import { Card, Col, Row, Table } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { annualSaleGraphAction, getDesignationByPost } from '../../../../redux/actions';
import AnnualSaleSummary from './AnnualSaleSummary';
import MainLoader from '../../../../components/MainLoader';
import { getAnnualSaleSummary, SalesVSSalary, AnnalTargetSummmary } from '../../../../redux/Annual/action';
import SalesVsSalary from './SalesVsSalary';
import AnnualTargetSummary from './AnnualTargetSummary';
import { CSVLink, CSVDownload } from "react-csv";

function AnnualSaleGraph() {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const getAnnualGraphDataHandle = store?.annualSaleSummaryReducer;
    const salesVsSalaryHandle = store?.annualSalesVsSalary;
    const AnnualTargetHandle = store?.annualTargetSummaryReducer;
    const [graphDataa, setGraphDataa] = useState([]);
    const [loader, setLoader] = useState(false);
    const [annualTarget, setAnnualTarget] = useState([]);
    const [saleVsSalary, setSaleVsSalary] = useState([]);

    const staticMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    useEffect(() => {
        dispatch(getAnnualSaleSummary(1));
        dispatch(SalesVSSalary(1));
        dispatch(AnnalTargetSummmary(1));
    }, []);
    useEffect(() => {
        if (getAnnualGraphDataHandle.data?.status == 200) {
            setGraphDataa(store?.annualSaleSummaryReducer?.data?.response);
        }
        if (salesVsSalaryHandle.data?.status == 200) {
            setSaleVsSalary(store?.annualSalesVsSalary?.data?.response);
        }
        if (AnnualTargetHandle?.data?.status == 200) {
            setAnnualTarget(store?.annualTargetSummaryReducer?.data?.response);
        }
    }, [store]);

    function percentage(partialValue, totalValue) {
       let res = (100 * partialValue) / totalValue
           if(totalValue===0){
            return 0
           }
           else{
               return Math.round(res)
           }
         } 
    return (
        <>
            <Card className="card-h-100">
                <Card.Body>
                    <Row>
                        <Col className="text-center my-2">
                            {' '}
                            <h3>ANNUAL SALES SUMMARY  <span><CSVLink filename={"Annual Sales Summary.csv"} data={graphDataa?.map((ele)=>{return {Month:staticMonths[new Date(ele?.Month).getMonth()],Expenditure:ele?.Expenditure,Sales:ele?.Revenue,Salary:ele?.Salary,TotalExpenditure:ele?.TotalExpenditure,Percentage:percentage(ele?.TotalExpenditure,ele?.Revenue)+"%"}})}  ><i className="dripicons-download ms-2 my-0"></i> </CSVLink></span></h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={7}>
                            <Table bordered size="sm">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Month</th>
                                        <th>Expenditure</th>
                                        <th>Salary</th>
                                        <th>Total Expenditure</th>
                                        <th>Sales</th>
                                        <th>% age</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {graphDataa.map((ele, ind) => {
                                        return (
                                            <tr>
                                                <td className='table-dark'>{staticMonths[new Date(ele?.Month).getMonth()]}</td>
                                                <td>₹ {INR_Format(ele?.Expenditure)}</td>
                                                <td>₹ {INR_Format(ele?.Salary)}</td>
                                                <td>₹ {INR_Format(ele?.TotalExpenditure)}</td>
                                                <td>₹ {INR_Format(ele?.Revenue)}</td>
                                                <td> {percentage(ele?.TotalExpenditure,ele?.Revenue)} %</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Col>
                        <Col lg={5}>
                            <Row className="text-center">
                                <Col lg={6} className="mx-auto mb-3">
                                    Annual Sales Summary
                                </Col>
                            </Row>
                            {getAnnualGraphDataHandle?.loading ? (
                                <MainLoader />
                            ) : (
                                <div dir="ltr">
                                    {/* <Chart
                        options={apexBarChartOpts}
                        series={apexBarChartData}
                        type="bar"
                        className="apex-charts"
                        height={412}
                        
                    /> */}
                                    <AnnualSaleSummary data={graphDataa} />
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div>
                <Card className="card-h-100">
                    <Card.Body>
                        <Row>
                            <Col className="text-center my-2">
                                {' '}
                                <h3>ANNUAL TARGET SUMMARY <span><CSVLink filename={"Annual Target Summary.csv"} data={annualTarget?.map((ele)=>{return {Month:staticMonths[new Date(ele?.Month).getMonth()],Sales:ele?.Revenue,Target:ele?.Target,Percentage:percentage(ele?.Target,ele?.Revenue)+"%"}})}  ><i className="dripicons-download ms-2 my-0"></i> </CSVLink></span></h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={6}>
                                <Table bordered size="sm">
                                    <thead className="bg-light table-dark">
                                        <tr>
                                            <th>Month</th>
                                            <th>Target</th>
                                            <th>Sales</th>
                                            <th>% age</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {annualTarget?.map((ele, ind) => {
                                            return (
                                                <tr>
                                                    <td className=" table-dark">{staticMonths[new Date(ele?.Month).getMonth()]}</td>
                                                    <td>₹ {INR_Format(ele?.Target[0])}</td>
                                                    <td>₹ {INR_Format(ele?.Revenue)}</td>
                                                    <td>{percentage(ele?.Target,ele?.Revenue)} %</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Col>
                            <Col lg={6}>
                                <Row className="text-center">
                                    <Col lg={6} className="mx-auto mb-3">
                                        Annual Target Summary
                                    </Col>
                                </Row>
                                {AnnualTargetHandle?.loading ? (
                                    <MainLoader />
                                ) : (
                                    <div dir="ltr">
                                        <AnnualTargetSummary data={annualTarget} />
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>

            <div>
                <Card className="card-h-100">
                    <Card.Body>
                        <Row>
                            <Col className="text-center my-2">
                                {' '}
                                <h3> SALARY VS SALES SUMMARY <span><CSVLink filename={"Sales Vs Salary.csv"} data={saleVsSalary?.map((ele)=>{return {...ele,Percentage:percentage(ele?.Salary,ele?.Sales)+ "%"}})}  ><i className="dripicons-download ms-2 my-0"></i> </CSVLink></span></h3>

                            </Col>
                        </Row>
                        <Row>
                            <Col lg={6}>
                                <Table bordered size="sm">
                                    <thead className="bg-light table-dark">
                                        <tr>
                                            <th>Month</th>
                                            <th>Salary</th>
                                            <th>Sales</th>
                                            <th>% age</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {saleVsSalary?.map((ele, ind) => {
                                            return (
                                                <tr>
                                                    <td className=" table-dark">{staticMonths[new Date(ele?.Month).getMonth()]}</td>
                                                    <td>₹ {INR_Format(ele?.Salary)}</td>
                                                    <td>₹ {INR_Format(ele?.Sales)}</td>
                                                    <td>{percentage(ele?.Salary,ele?.Sales)} %</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Col>
                            <Col lg={6}>
                                <Row className="text-center">
                                    <Col lg={6} className="mx-auto mb-3">
                                        Salary vs Sales Summary
                                    </Col>
                                </Row>
                                {salesVsSalaryHandle?.loading ? (
                                    <MainLoader />
                                ) : (
                                    <div dir="ltr">
                                        <SalesVsSalary data={saleVsSalary} />
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}
export default AnnualSaleGraph;
