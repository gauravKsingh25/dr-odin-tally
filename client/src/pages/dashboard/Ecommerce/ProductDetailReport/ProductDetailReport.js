import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, Table, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productWiseReportAction, productWiseCSVReportAction, getProductDetailAction } from '../../../../redux/dashboard/actions';
import MainLoader from '../../../../components/MainLoader';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { CSVLink, CSVDownload } from 'react-csv';
import { useReactToPrint } from 'react-to-print';
import '../style.css';
import { getProductDetailReportApi } from '../../../../redux/dashboard/api';

function Productreport() {
    const store = useSelector((state) => state);
    const location = useLocation();
    const Navigate = useNavigate();
    const [showModel, setShowModel] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(1);
    const [render, setRender] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEnddate] = useState('');
    const [skip, setSkip] = useState(1);
    const [CsvData, setCSVData] = useState([]);
    const [isFilter, setIsFilter] = useState(false);
    const getProductHandle = store?.ProductReportReducer;
    const csvHandle = store?.ProductCSVReportReducer;
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const handleRefresh = () => {
        setRender(!render);
    };
    const [productdata, setProductData] = useState([]);
    const dispatch = useDispatch();
    const truncate = (value, length) => {
        if (value?.length > length) {
            return value?.slice(0, length) + '...';
        } else {
            return value;
        }
    };
    const handleSearchChange = (e) => {
        if (e.target.value.trim() !== '') {
            dispatch(
                productWiseReportAction({
                    currentMonth: currentMonth,
                    skip: skip,
                    startDate: '',
                    endDate: '',
                    searchkey: e.target.value.trim(),
                    product: '',
                })
            );
        } else {
            dispatch(
                productWiseReportAction({
                    currentMonth: currentMonth,
                    skip: skip,
                    startDate: '',
                    endDate: '',
                    searchkey: '',
                    product: '',
                })
            );
        }
    };
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(
            productWiseReportAction({
                currentMonth: currentMonth,
                skip: value,
                startDate: '',
                endDate: '',
                searchkey: '',
                product: '',
            })
        );
        // Navigate(`/product-wise-report/${value}`,{ state: { skip:value } });
    };

    const downloadFileDocument = useReactToPrint({
        content: () => document.querySelector('.downloademploydata'),
    });
    const handleDownload = () => {
        downloadFileDocument();
    };
    useEffect(() => {
        dispatch(
            productWiseReportAction({
                currentMonth: currentMonth,
                skip: skip,
                startDate: '',
                endDate: '',
                searchkey: '',
                product: '',
            })
        );
        dispatch(
            productWiseCSVReportAction({
                currentMonth: 0,
                skip: 1,
                startDate: '',
                endDate: '',
                searchkey: '',
                product: 2000,
            })
        );
        
    }, [render]);
    useEffect(() => {
        if (getProductHandle?.productreport?.status == 200) {
            setProductData(store?.ProductReportReducer?.productreport?.response);
        }
    }, [store]);
    useEffect(() => {
        if (csvHandle?.productreport?.status == 200) {
            setCSVData(store?.ProductCSVReportReducer?.productreport?.response);
        }
    }, [store]);

    const handleSetDateRangeClick = () => {
        setIsFilter(true);
        dispatch(
            productWiseReportAction({
                currentMonth: 0,
                skip: 1,
                startDate: state[0]?.startDate,
                endDate: state[0]?.endDate,
                searchkey: '',
                product: '',
            })
        );
        dispatch(
            productWiseCSVReportAction({
                currentMonth: 0,
                skip: 1,
                startDate: state[0]?.startDate,
                endDate: state[0]?.endDate,
                searchkey: '',
                product: 2000,
            })
        );
        setShowModel(false);
    };
    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x);
    };

    function average(a, b) {
        // let c = b.split(' ')[0];
        let aver = a / b;
        return Math.round(aver);
    }
    const handleNavigate = (route) => {
        // let res = route.replace("/", " ")
        Navigate(`/product-wise-report/${route?.pid}`)
    
    }
   

    return (
        <>
            <Card>
                <Card.Body>
                    <Row>
                        <Col className="" lg={12} md={12} sm={12} xs={12}>
                            <Row>
                                <Col lg={4} md={4} sm={4} xs={4}></Col>
                                <Col className="" lg={4} md={4} sm={4} xs={4}>
                                    <h4 className="header-title mt-1 font-18 fw-bold">Product Wise Sale Report</h4>
                                </Col>

                                <Col className="mb-1" lg={4} md={4} sm={4} xs={4}>
                                    <div className="d-flex justify-content-end header-title">
                                        <div className="app-search px-0">
                                            <div className=" position-relative ">
                                                <input
                                                    onChange={handleSearchChange}
                                                    type="text"
                                                    className="form-control py-1"
                                                    placeholder="Search "
                                                />
                                                <span className="mdi mdi-magnify search-icon"></span>
                                            </div>
                                        </div>
                                        <Button
                                            className="btn btn-primary ms-2 py-1 px-2 "
                                            onClick={() => {
                                                setShowModel(true);
                                            }}>
                                            <i className="mdi mdi-calendar-range font-18"></i>
                                        </Button>

                                        <Button onClick={handleRefresh} className="btn btn-primary ms-2 py-1 px-2 ">
                                            <i className="mdi mdi-autorenew font-18"></i>
                                        </Button>

                                        {csvHandle?.loading ? (
                                            <Button className="btn btn-primary ms-2 py-1 ">
                                                <div
                                                    class="spinner-border "
                                                    style={{ height: '1rem', width: '1rem' }}
                                                    role="status"></div>
                                            </Button>
                                        ) : (
                                            <CSVLink
                                                id="CSVDOWNLOAD"
                                                filename={'Product Summary.csv'}
                                                data={CsvData.map((ele) => {
                                                    return {
                                                        Name: ele?.Name,
                                                        Quantity: ele?.productPcs,
                                                        Amount: ele?.TOTALAMT,
                                                        Average: average(ele?.TOTALAMT, ele?.productPcs)
                                                    };
                                                })}>
                                                {' '}
                                                <Button className="btn btn-primary ms-2 py-1 px-2 ">
                                                    <i className=" mdi mdi-download font-18"></i>
                                                </Button>
                                            </CSVLink>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <Row className="mt-1">
                                <Col className="d-flex" lg={6}>
                                    <h4 className="font-18 fw-bolder ">Total Count : </h4>
                                    <h3 className="font-18 fw-bolder fw-normal">
                                        &nbsp;   {store?.ProductReportReducer?.productreport?.productsCount}
                                    </h3>
                                </Col>

                                <Col className="d-flex justify-content-end" lg={6}>
                                    <h4 className="font-18 fw-bolder ms-3 ">Total Amount : </h4>
                                    <h3 className="font-18 fw-bolder fw-normal ">
                                        &nbsp;      {store?.ProductReportReducer?.productreport?.Total_Amount
                                            ? ' ₹ ' +
                                            INR_Format(store?.ProductReportReducer?.productreport?.Total_Amount)
                                            : '0'}
                                    </h3>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {getProductHandle?.loading ? (
                        <MainLoader />
                    ) : (
                        <Table hover responsive className="mb-0  downloademploydata" size="sm">
                            <thead className="table-dark">
                                <th>
                                    <h5 className="text-white">#</h5>
                                </th>
                                <th>
                                    <h5 className="text-white">Product Name</h5>
                                </th>
                                <th>
                                    <h5 className="text-white text-center">Qty</h5>
                                </th>
                                <th>
                                    <h5 className="text-white text-center">Amount</h5>
                                </th>
                                <th>
                                    <h5 className="text-white text-center">Average</h5>
                                </th>
                            </thead>
                            <tbody>
                                {productdata?.map((ele, ind) => (
                                    <tr>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal">{(skip - 1) * 50 + ind + 1}</h6>
                                        </td>
                                        <td onClick={() => handleNavigate(ele)} style={{ cursor: "pointer" }}>
                                            <h6 className="font-14 my-1 fw-normal" >{ele?.Name}</h6>
                                        </td>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal text-center">{ele?.productPcs}</h6>
                                        </td>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal text-center">
                                                ₹{INR_Format(ele?.TOTALAMT)}
                                            </h6>
                                        </td>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal text-center">
                                                {average(ele?.TOTALAMT, ele?.productPcs)}
                                            </h6>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                {store?.ProductReportReducer?.productreport?.paginationCount > 0 && (
                    <Row>
                        <Col lg={12} className="d-flex justify-content-end">
                            <Stack spacing={2}>
                                <Pagination
                                    count={store?.ProductReportReducer?.productreport?.paginationCount}
                                    variant="outlined"
                                    shape="rounded"
                                    color="primary"
                                    onChange={handlePaginationChange}
                                />
                            </Stack>
                        </Col>
                    </Row>
                )}
            </Card>

            {/* date range modal  */}
            <Modal
                dialogClassName="date-range-modal"
                size={'lg '}
                centered={true}
                show={showModel}
                onHide={() => {
                    setShowModel(false);
                }}>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <DateRangePicker
                        onChange={(item) => setState([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={state}
                        direction="horizontal"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSetDateRangeClick}>
                        Next
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
export default Productreport;
