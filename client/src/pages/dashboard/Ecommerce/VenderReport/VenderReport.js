import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Row, Col } from 'react-bootstrap';
import { DateRangePicker } from 'react-date-range';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import 'react-date-range/dist/styles.css';
import '../style.css';
import { CSVLink, CSVDownload } from "react-csv";
import 'react-date-range/dist/theme/default.css';
import { getVenderReportAction, vendorCSVReportAction } from '../../../../redux/dashboard/actions';
import MainLoader from '../../../../components/MainLoader';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
const VenderReport = () => {
    const [render, setRender] = useState(true);
    const dispatch = useDispatch();
    const Navigate = useNavigate();
    const store = useSelector((state) => state);
    const [showModel, setShowModel] = useState(false);
    const [vendordata, setVendorData] = useState([]);
    const [CsvData, setCSVData] = useState([])
    const [currentMonth, setCurrentMonth] = useState(1);
    const [skip, setSkip] = useState(1);
    const getVendorHandle = store?.VendorListReducer;
    const csvHandle = store?.vendorCSVReducer;
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value)
        dispatch(getVenderReportAction({ currentMonth: currentMonth, skip: value,startDate: '',
        endDate: '', searchkey: "" ,vendor:"" }))
        // Navigate(`/product-wise-report/${value}`,{ state: { skip:value } });   
    }
    useEffect(() => {
        dispatch(getVenderReportAction({ currentMonth: currentMonth, skip: skip, startDate: "", endDate: "", searchkey: "" ,vendor:"" }));
        dispatch(
            vendorCSVReportAction({
                currentMonth: 0,
                skip: 1,
                startDate: '',
                endDate: '',
                searchkey: '',
                vendor: 10000,
            })
        );
    }, [render]);
   

    useEffect(() => {
        if (getVendorHandle?.vendorreport?.status == 200) {
            setVendorData(store?.VendorListReducer?.vendorreport?.response);
        }
    }, [store]);
    useEffect(() => {
        if (csvHandle?.vendorreport?.status == 200) {
            setCSVData(store?.vendorCSVReducer?.vendorreport?.response);
        }
    }, [store]);

    const handleRefresh = () => {
        setRender(!render);
        window.location.reload();
    };
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const INR_Format = (x) => { 
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    const handleSearchChange = (e) => {
        if (e.target.value.trim() !== "") {
            dispatch(getVenderReportAction({ currentMonth: currentMonth, skip: skip, startDate: "", endDate: "", searchkey: e.target.value.trim() , vendor:"" }));
        }
        else {
            dispatch(getVenderReportAction({ currentMonth: currentMonth, skip: skip, startDate: "", endDate: "", searchkey: "" ,vendor:"" }));
        }
    }
    const handleSetDateRangeClick = () => {
        dispatch(
            getVenderReportAction({ currentMonth: 0, skip: 1, startDate: state[0]?.startDate, endDate: state[0]?.endDate, searchkey: "" ,vendor:"" })
        );
        setShowModel(false);
    };

    function average(a, b) {
        // let c = b.split(" ")[0]
        let aver = a / b
        return Math.round(aver)
    }
    const handleNavigate = (route) => {
        // let res = route.replace("/", " ")
        Navigate(`/Vendor-report/${route?.vid}`)
    }
    return (
        <>

            <Card className="h-100 mb-0">
                <Card.Body className="pb-0">

                    <Row>
                        <Col className="" lg={12}>
                            <Row>
                                <Col className="d-flex" lg={4}>
                                    <h4 className="font-16 fw-bolder ">Total Vendor : </h4>
                                    <h3 className="font-16 fw-normal">{store?.VendorListReducer?.vendorreport?.vendorCount}</h3>
                                </Col>
                                <Col className=" text-center " lg={4}>
                                    <h4 className="header-title mt-1 font-16 ">Vendor Report</h4>
                                </Col>

                                <Col className="mb-2" lg={4}>
                                    <div className="d-flex justify-content-end header-title">
                                        <div className="app-search px-0">
                                            <div className=" position-relative ">
                                                <input onChange={handleSearchChange}
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search " />
                                                <span className="mdi mdi-magnify search-icon"></span>
                                            </div>
                                        </div>
                                        <Button
                                            className="btn btn-primary ms-2   "
                                            onClick={() => {
                                                setShowModel(true);
                                            }}>
                                            <i className="mdi mdi-calendar-range font-18"></i>
                                        </Button>

                                        <Button onClick={handleRefresh} className="btn btn-primary ms-2 ">
                                            <i className="mdi mdi-autorenew font-18"></i>
                                        </Button>


                                        <CSVLink
                                            id="CSVDOWNLOAD"
                                            filename={"Vendor Report.csv"}
                                            data={CsvData.map((ele) => {
                                                return {
                                                    Name: ele?.Vendor,
                                                    Quantity: ele?.Quantity,
                                                    Amount: ele?.Amount,
                                                    Average: average(ele?.Amount, ele?.Quantity)
                                                };
                                            })}>
                                            <Button className="btn btn-primary ms-2 " >
                                                <i className=" mdi mdi-download font-18"></i>
                                            </Button>
                                        </CSVLink>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {getVendorHandle?.loading ?
                        <MainLoader />
                        :
                        <Table hover responsive className="mb-0 " size="sm">
                            <thead className="bg-primary">
                                <th className="">
                                    <h5 className="text-white">#</h5>
                                </th>
                                <th className=" text-nowrap">
                                    <h5 className="text-white "> Vendor Name</h5>
                                </th>

                                <th className="">
                                    <h5 className="text-white ">Qty</h5>
                                </th>
                                <th className="">
                                    <h5 className="text-white ">Amount</h5>
                                </th>
                                <th className="">
                                    <h5 className="text-white ">Average</h5>
                                </th>
                            </thead>
                            <tbody>
                                {vendordata?.map((ele, ind) => (
                                    <tr>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal">{(skip - 1) * 50 + ind + 1}</h6>
                                        </td>
                                        <td onClick={() => handleNavigate(ele)} style={{ cursor: "pointer" }}>
                                            <h6 className="font-14 my-1 fw-normal">{ele?.Vendor}</h6>
                                        </td>

                                        <td>
                                            <h6 className="font-14 my-1 fw-normal">{ele?.Quantity}</h6>
                                        </td>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal">₹{INR_Format(ele?.Amount)}</h6>
                                        </td>
                                        <td>
                                            <h6 className="font-14 my-1 fw-normal">{average(ele?.Amount, ele?.Quantity)}</h6>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>}
                </Card.Body>
                {store?.VendorListReducer?.vendorreport?.paginationCount > 0 && <Row>
                    <Col lg={12} className="d-flex justify-content-end">
                        <Stack spacing={2}>
                            <Pagination
                                count={store?.VendorListReducer?.vendorreport?.paginationCount}
                                variant="outlined"
                                shape="rounded"
                                color="primary"
                                onChange={handlePaginationChange}
                            />
                        </Stack>
                    </Col>
                </Row>}



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
};

export default VenderReport;
