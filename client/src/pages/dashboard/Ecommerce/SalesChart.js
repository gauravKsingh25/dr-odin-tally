// @flow
import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Card, Table, Button, Row, Col, } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import MainLoader from '../../../components/MainLoader';
// component
import CardTitle from '../../../components/CardTitle';

const SalesChart = (): React$Element<any> => {
    const store = useSelector((state) => state)
    const loaderHandel = store?.ProductReportReducer;
    const [productList, setProductList] = useState([])
    const handleProductShow = (ind) => {
        setProductList(productList?.map((ele, index) => ind === index ? { ...ele, show: !ele.show } : { ...ele, show: false }))
    }
    useEffect(() => {
        setProductList(store?.ProductReportReducer?.productreport?.response)
    }, [store])

    const truncate = (value, length) => {
        if (value?.length > length) {
            return value?.slice(0, length) + "..."
        }
        else {
            return value
        }
    }


    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    function average(a, b) {
        // let c = b.split(" ")[0]
        let aver = a / b
        return Math.round(aver)
    }
    return (
        <Card className='h-100 mb-0'>
            <Card.Body className='pb-0'>
                {/* <CardTitle
                    containerClass="d-flex align-items-center justify-content-between fw-bold  pb-2"
                    title="Product Wise Report"
                    menuItems={[
                        { label: 'Sales Report' },
                        { label: 'Export Report' },
                        { label: 'Profit' },
                        { label: 'Action' },
                    ]}
                /> */}



                {/* <Chart
                    options={apexDonutOpts}
                    series={apexDonutData}
                    type="donut"
                    height={222}
                    className="apex-charts mb-4 mt-4"
                />

                <div className="chart-widget-list">
                    <p>
                        <i className="mdi mdi-square text-primary"></i> North
                        <span className="float-end">72K</span>
                    </p>
                    <p>
                        <i className="mdi mdi-square text-danger"></i> South
                        <span className="float-end">39K</span>
                    </p>
                    <p>
                        <i className="mdi mdi-square text-success"></i> East
                        <span className="float-end">25K</span>
                    </p>
                    <p className="mb-0">
                        <i className="mdi mdi-square text-warning"></i> West
                        <span className="float-end">61k</span>
                    </p>
                </div> */}
                <Row>
                    <Col lg={12} md={12} sm={12} xs={12} className='pb-2'>
                        <Row>
                            <Col lg={8} md={9} sm={9} xs={9}>
                                <h4 className="header-title mt-1 ">Product Wise Report</h4>
                            </Col>
                            <Col className="text-end  show-desktop " lg={4} md={3}   >
                                <Link to="/product-wise-report">   <Button className="btn btn-primary ms-auto pt-0 pb-0 ps-1 pe-1  ">
                                    <i className="dripicons-arrow-thin-right"></i></Button></Link>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {loaderHandel?.loading ? <MainLoader /> :
                    <Table hover responsive className="mb-0 " size="sm">
                        <thead className='bg-primary'>
                            <th>
                                <h5 className='text-white'>#</h5>
                            </th>
                            <th>
                                <h5 className='text-white '>Product Name</h5>
                            </th>
                            <th>
                                <h5 className='text-white '>Qty</h5>
                            </th>
                            <th>
                                <h5 className='text-white '>Amount</h5>
                            </th>
                            <th>
                                <h5 className='text-white '>Average</h5>
                            </th>
                        </thead>
                        <tbody>
                            {productList?.slice(0, 10)?.map((ele, ind) => <tr>
                                <td>
                                    <h6 className="font-12 my-1 fw-normal">{ind + 1}</h6>
                                </td>
                                {!ele.show ? <td>
                                    <h6 style={{ cursor: "pointer" }} className="font-12 my-1 fw-normal " onClick={() => handleProductShow(ind)}>{truncate(ele?.Name, 35)}</h6>
                                </td> : <td>
                                    <h6 style={{ cursor: "pointer" }} className="font-12 my-1 fw-normal " onClick={() => handleProductShow(ind)}>{ele?.Name}</h6>
                                </td>}
                                <td>
                                    <h6 className="font-12 my-1 fw-normal ">{ele?.productPcs}</h6>
                                </td>
                                <td>
                                    <h6 className="font-12 my-1 fw-normal ">₹{INR_Format(ele?.TOTALAMT)}</h6>
                                </td>
                                <td>
                                    <h6 className="font-12 my-1 fw-normal ">{average(ele?.TOTALAMT, ele?.productPcs)}</h6>
                                </td>
                            </tr>)}
                        </tbody>
                    </Table>}
            </Card.Body>
        </Card>
    );
};

export default SalesChart;
