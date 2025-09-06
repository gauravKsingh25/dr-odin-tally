// @flow
import React from 'react';
import { Card, ProgressBar, Row, Col } from 'react-bootstrap';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSelector } from 'react-redux';
import "./style.css";

// component
import CardTitle from '../../../components/CardTitle';

// components
import { WorldVectorMap } from '../../../components/VectorMap/';

const RevenueByLocationChart = (): React$Element<React$FragmentType> => {
    const store = useSelector((state) => state)
    // vector map config
    // const options = {
    //     zoomOnScroll: false,
    //     markers: [
    //         { name: 'New York', coords: [40.71, -74.0] },
    //         { name: 'San Francisco', coords: [37.77, -122.41] },
    //         { name: 'Sydney', coords: [-33.86, 151.2] },
    //         { name: 'Singapore', coords: [1.3, 103.8] },
    //     ],
    //     markerStyle: {
    //         initial: {
    //             r: 9,
    //             fill: '#727cf5',
    //             'fill-opacity': 0.9,
    //             stroke: '#fff',
    //             'stroke-width': 7,
    //             'stroke-opacity': 0.4,
    //         },
    //         hover: {
    //             fill: '#727cf5',
    //             stroke: '#fff',
    //             'fill-opacity': 1,
    //             'stroke-width': 1.5,
    //         },
    //     },
    //     regionStyle: {
    //         initial: {
    //             fill: '#e3eaef',
    //         },
    //     },
    // };
    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }

    return (
        <>
            <Card className='h-100'>
                <Card.Body>
                    {/* <CardTitle
                        containerClass="d-flex align-items-center justify-content-between fw-bold"
                        title="Revenue By Location"
                        menuItems={[
                            { label: 'Sales Report' },
                            { label: 'Export Report' },
                            { label: 'Profit' },
                            { label: 'Action' },
                        ]}
                    >
                        </CardTitle> */}

                    {/* <div className="mb-4 mt-4">
                        <WorldVectorMap height="224px" width="100%" options={options} />
                    </div> */}
                    <Row>
                        <Col lg={12} className='pb-2'>
                            <Row>
                                <Col lg={12}>
                                    <h4 className="header-title mt-1 ">Sales By Location</h4>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row >
                        <Col lg={12}>
                            <h5 className="  mb-1 mt-4 fw-large">North</h5>
                            <Row>
                                <Col lg={12} md={12} xs={12}  >

                                    <Row>
                                        <Col lg={8} md={8} xs={8} className='lt-tooltip' >



                                            <span className="left-arrow" >
                                                <strong>{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.northPcs ? store?.RevenueByLocationtReducer?.revenuebylocation?.result?.northPcs : "0"} </strong>
                                            </span>
                                            <ProgressBar now={"0"} className="progress-sm w-100 mt-1 " />


                                        </Col>
                                        <Col className='text-start mx-0 px-0' lg={4} md={4} xs={4} >


                                            <span className="progress-value fw-bold font-15"> ₹{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.north ? INR_Format(store?.RevenueByLocationtReducer?.revenuebylocation?.result?.north) : "0"}</span>

                                        </Col>
                                    </Row>

                                </Col>
                            </Row>

                            <h5 className="mb-1 mt-4 fw-large">South</h5>
                            <Row>
                                <Col lg={12} md={12} xs={12}>
                                    <Row>
                                        <Col lg={8} md={8} xs={8} className='lt-tooltip'>
                                            <span className="left-arrow">
                                                <strong>{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.southPcs ? store?.RevenueByLocationtReducer?.revenuebylocation?.result?.southPcs : "0"} </strong>
                                            </span>
                                            <ProgressBar now={"0"} className="progress-sm w-100 mt-1 " />

                                        </Col>
                                        <Col className="mx-0 px-0" lg={4} md={4} xs={4} >
                                            <span className="progress-value fw-bold font-15 "> ₹{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.south ? INR_Format(store?.RevenueByLocationtReducer?.revenuebylocation?.result?.south) : "0"}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>





                            <h5 className="mb-1 mt-4 fw-large">East</h5>
                            <Row>
                                <Col lg={12} md={12} xs={12}>
                                    <Row>
                                        <Col lg={8} md={8} xs={8} className='lt-tooltip'>
                                            <span className="left-arrow">
                                                <strong>{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.eastPcs ? store?.RevenueByLocationtReducer?.revenuebylocation?.result?.eastPcs : "0"} </strong>
                                            </span>
                                            <ProgressBar now={"0"} className="progress-sm  w-100 mt-1" />

                                        </Col>
                                        <Col className="mx-0 px-0" lg={4} md={4} xs={4}>
                                            <span className="progress-value fw-bold font-15"> ₹{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.east ? INR_Format(store?.RevenueByLocationtReducer?.revenuebylocation?.result?.east) : "0"}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>


                            <h5 className="  mt-4 fw-large">West</h5>
                            <Row>
                                <Col lg={12} md={12} xs={12}>
                                    <Row>
                                        <Col lg={8} md={8} xs={8} className='lt-tooltip'>
                                            <span className="left-arrow">
                                                <strong>{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.westPcs ? store?.RevenueByLocationtReducer?.revenuebylocation?.result?.westPcs : "0"}</strong>
                                            </span>
                                            <ProgressBar now={"0"} className="progress-sm w-100 mt-1" />

                                        </Col>
                                        <Col className="mx-0 px-0" lg={4} md={4} xs={4}>
                                            <span className="progress-value fw-bold font-15">₹{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.west ? INR_Format(store?.RevenueByLocationtReducer?.revenuebylocation?.result?.west) : "0"}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>


                            <h5 className="  mt-4 fw-large">Central</h5>
                            <Row className='mb-4'>
                                <Col lg={12} md={12} xs={12}>
                                    <Row>
                                        <Col lg={8} md={8} xs={8} className='lt-tooltip'>
                                            <span className="left-arrow">
                                                <strong>{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.cntrPcs ? store?.RevenueByLocationtReducer?.revenuebylocation?.result?.cntrPcs : "0"}</strong>
                                            </span>
                                            <ProgressBar now={"0"} className="progress-sm w-100 mt-1" />

                                        </Col>
                                        <Col className="mx-0 px-0" lg={4} md={4} xs={4}>
                                            <span className="progress-value fw-bold font-15">₹{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.central ? INR_Format(store?.RevenueByLocationtReducer?.revenuebylocation?.result?.central) : "0"}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <hr ></hr>

                            <Row>
                                <Col className='mt-2' lg={12} md={12} xs={12}>
                                    <Row>
                                        <Col lg={8} md={8} xs={8}>
                                            <h5 className="mt-1  pt-1 font-17 fw-bold">TOTAL</h5>
                                        </Col>
                                        <Col className='mx-0 px-0 mt-1' lg={4} md={4} xs={4} >
                                            <span className='fw-bold mt-2 ms-auto font-16'>₹{store?.RevenueByLocationtReducer?.revenuebylocation?.result?.total ? INR_Format(store?.RevenueByLocationtReducer?.revenuebylocation?.result?.total) : "0"}</span>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>



                        </Col>
                    </Row>

                </Card.Body>
            </Card>
        </>
    );
};

export default RevenueByLocationChart;
