// @flow
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
// components
import HyperDatepicker from '../../../components/Datepicker';

import Statistics from './Statistics';
import PerformanceChart from './PerformanceChart';
import RevenueChart from './RevenueChart';
import RevenueByLocationChart from './RevenueByLocationChart';
import SalesChart from './SalesChart';
// import Activity from './Activity';
import Products from './Products';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays, subDays } from "date-fns";
import "./style.css"
import { getOverAllApi, getRevenueByLocationAction, getSaleExecutiveReportAction } from '../../../redux/dashboard/actions';
import { totalMonthSaleAction, totalExpenditureAction, monthExpenditureAction, targetAchievedAction, productWiseReportAction, getVenderReportAction, annualSaleGraphAction } from '../../../redux/dashboard/actions';
import { getCity, getState, getcityByState } from '../../../redux/setting/action';
import ToastHandle from "../../../constants/Toaster/Toaster"
import Vender from './Vender';


const EcommerceDashboard = (): React$Element<React$FragmentType> => {
    const dispatch = useDispatch()
    const store = useSelector((state) => state)
    const [showModel, setShowModel] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(1)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEnddate] = useState("")
    const [render, setRender] = useState(false)
    const [stateId, setStateId] = useState("")
    const [cityId, setCityId] = useState("")
    const [data, setData] = useState({ state: "", city: "" })
    const [getStateData, setStateData] = useState([])
    const [getCityData, setCityData] = useState([])
    const handleStateChange = (e) => {
        const stateIdd = e.target.value
        if (stateIdd.trim() == "") {
            setData({ state: "", city: "" })
        }
        else {
            setData({ ...data, state: e.target.value })
            dispatch(getcityByState(stateIdd))
        }
        // dispatch(totalMonthSaleAction({currentMonth:0,startDate:startDate,endDate:endDate,state:stateIdd,city:data?.city}))
        // dispatch(monthExpenditureAction({currentMonth:0,startDate:startDate,endDate:endDate,state:stateIdd,city:data?.city}))
        // dispatch(targetAchievedAction({currentMonth:0,startDate:startDate,endDate:endDate,state:stateIdd,city:data?.city}))
        // dispatch(getSaleExecutiveReportAction({currentMonth:0,startDate:startDate,endDate:endDate,state:stateIdd,city:data?.city}))
        //  dispatch(getRevenueByLocationAction({currentMonth:0,startDate:startDate,endDate:endDate ,state:stateIdd,city:data?.city}))
    }
    const handleCityChange = (e) => {
        if (data?.state.trim() !== "") {
            let cityIdd = e.target.value
            setData({ ...data, city: e.target.value })
        }
        else {
            ToastHandle("error", "Please Choose State First")
        }
        // dispatch(totalMonthSaleAction({currentMonth:0,startDate:startDate,endDate:endDate,state:data?.state,city:cityIdd}))
        // dispatch(monthExpenditureAction({currentMonth:0,startDate:startDate,endDate:endDate,state:data?.state,city:cityIdd}))
        // dispatch(targetAchievedAction({currentMonth:0,startDate:startDate,endDate:endDate,state:data?.state,city:cityIdd}))
        // dispatch(getSaleExecutiveReportAction({currentMonth:0,startDate:startDate,endDate:endDate,state:data?.state,city:cityIdd}))
        //  dispatch(getRevenueByLocationAction({currentMonth:0,startDate:startDate,endDate:endDate ,state:data?.state,city:cityIdd}))

    }

    const handleSearchClick = () => {
        if (data?.state.trim() !== "") {
            dispatch(totalMonthSaleAction({ currentMonth: 0, startDate: startDate, endDate: endDate, state: data?.state, city: data?.city }))
            dispatch(monthExpenditureAction({ currentMonth: 0, startDate: startDate, endDate: endDate, state: data?.state, city: data?.city }))
            dispatch(targetAchievedAction({ currentMonth: 0, startDate: startDate, endDate: endDate, state: data?.state, city: data?.city }))
            dispatch(getSaleExecutiveReportAction({ currentMonth: 0, startDate: startDate, endDate: endDate, state: data?.state, city: data?.city }))
            dispatch(getRevenueByLocationAction({ currentMonth: 0, startDate: startDate, endDate: endDate, state: data?.state, city: data?.city }))
        }
        else {
            ToastHandle("error", "Please Select State First")
        }
    }
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const handleRefresh = () => {
        window.location.reload()
    }
    const handleSetDateRangeClick = () => {
        dispatch(totalMonthSaleAction({ currentMonth: 0, startDate: state[0]?.startDate, endDate: state[0]?.endDate, state: data?.state, city: data?.city }))
        dispatch(monthExpenditureAction({ currentMonth: 0, startDate: state[0]?.startDate, endDate: state[0]?.endDate, state: data?.state, city: data?.city }))
        dispatch(targetAchievedAction({ currentMonth: 0, startDate: state[0]?.startDate, endDate: state[0]?.endDate, state: data?.state, city: data?.city }))
        dispatch(getSaleExecutiveReportAction({ currentMonth: 0, startDate: state[0]?.startDate, endDate: state[0]?.endDate, state: data?.state, city: data?.city }))
        dispatch(getRevenueByLocationAction({ currentMonth: 0, startDate: state[0]?.startDate, endDate: state[0]?.endDate, state: data?.state, city: data?.city }))
        dispatch(productWiseReportAction({ currentMonth: 0, startDate: state[0]?.startDate, endDate: state[0]?.endDate, skip: 1, searchkey: "", product: "" }))
        setShowModel(false)
    };
    useEffect(() => {
        dispatch(getOverAllApi())
        dispatch(totalMonthSaleAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, state: stateId, city: cityId }))
        dispatch(totalExpenditureAction())
        dispatch(monthExpenditureAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, state: stateId, city: cityId }))
        dispatch(targetAchievedAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, state: stateId, city: cityId }))
        dispatch(productWiseReportAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, skip: 1, searchkey: "", product: "" }))
        dispatch(getVenderReportAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, skip: 1, searchkey: "",vendor:"" }))
        dispatch(annualSaleGraphAction())
        dispatch(getSaleExecutiveReportAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, state: stateId, city: cityId }))
        dispatch(getRevenueByLocationAction({ currentMonth: currentMonth, startDate: startDate, endDate: endDate, state: stateId, city: cityId }))
    }, [])
    useEffect(() => {
        dispatch(getCity({ id: "", skip: 1 }))
        dispatch(getState())

    }, [])

    useEffect(() => {
        setStateData(store?.getStateReducer?.data?.response)
        setCityData(store?.getCityByState?.data?.response)
    }, [store])
    return (
        <>
            <Row>
                <Col xs={12}>
                    <Row>
                        <Col lg={6}>
                            <div className="page-title-box ">
                                <div className="page-title-left mb-2 pb-1 ">
                                    <form className="d-flex text ">


                                        <div className="mt-2 pt-1 ">

                                            <div className=" position-relative  ">

                                                <Form.Group>
                                                    <Form.Select className='statecitywidth' style={{ backgroundColor: '#f1f3fa', color: 'black', width: '187px' }}
                                                        onChange={handleStateChange}
                                                        value={data?.state}
                                                    >
                                                        <option value="" > State</option>
                                                        {getStateData?.map((ele, ind) => {
                                                            return (

                                                                <option className="fontsize" value={ele?._id}>{ele?.state} </option>

                                                            )
                                                        })}
                                                    </Form.Select>
                                                </Form.Group>


                                            </div>

                                        </div>

                                        <div className="mt-2 pt-1  ms-2">

                                            <div className=" position-relative  ">

                                                <Form.Group>
                                                    <Form.Select className='' style={{ backgroundColor: '#f1f3fa', color: 'black', width: '187px' }}
                                                        onChange={handleCityChange}
                                                        disabled={data?.state?.trim() === ""}
                                                        value={data?.city}
                                                    >

                                                        <option value=""> City </option>
                                                        {getCityData?.length > 0 ? getCityData?.map((ele, ind) => {
                                                            return (

                                                                <option value={ele?._id}  >{ele?.city} </option>

                                                            )
                                                        }) :
                                                            <option value=""> no data found </option>}
                                                    </Form.Select>
                                                </Form.Group>


                                            </div>

                                        </div>
                                        <div className="mt-2 pt-1  ms-2"> <Button className='py-1 px-2' onClick={handleSearchClick}> <i className=" dripicons-search font-18"></i></Button></div>


                                    </form>
                                </div>

                            </div>
                        </Col>
                        <Col className="mb-md-2 mt-md-2 pt-md-1 mb-2 pb-1 pb-md-1 " lg={6}>
                            <div className="page-title-box">
                                <div className="page-title-right" >
                                    <form className="d-flex text  align-items-center ">
                                        {/* <div className="app-search ">
                                        
                                        <div className=" position-relative  ">
                                            <input
                                                type="text"
                                                className="form-control font-18"
                                                placeholder="Search "
                                            />
                                            <span className="mdi mdi-magnify search-icon "></span>
                                        </div>
                                
                                </div> */}
                                        <Button className=" ms-2 py-1 px-2 " onClick={() => { setShowModel(true) }}>
                                            <i className="mdi mdi-calendar-range font-20" ></i>
                                        </Button>

                                        <Link to="#" className=" ms-2" onClick={handleRefresh}>
                                            <Button className='py-1 px-2'> <i className="mdi mdi-autorenew font-20"></i></Button>

                                        </Link>
                                        {/* <Link to="#" className="btn btn-primary ms-2">
                                    <i className="mdi mdi-filter-variant font-18"></i>
                                </Link> */}
                                    </form>
                                </div>
                                {/* <h4 className="page-title">Dashboard</h4> */}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row className=''>
                <Col xl={5} lg={6} >
                    <Statistics />
                </Col>

                <Col xl={7} lg={6} >
                    <PerformanceChart />
                </Col>
            </Row>

            <Row className='pb-3'>
                <Col lg={8}>
                    <RevenueChart />
                </Col>
                <Col className='mt-3 mt-md-0' lg={4}>
                    <RevenueByLocationChart />
                </Col>
            </Row>


            <Row className='pb-3'>
                <Col lg={6}>
                    <Products />
                </Col>
                <Col className='mt-3 mt-md-0' lg={6}>
                    <Row>
                        <Col lg={12}>
                            <SalesChart />
                        </Col>
                    </Row>
                    <Row className='mt-3'>
                        <Col lg={12}>
                            <Vender />
                        </Col>
                    </Row>
                </Col>
            </Row>



            <Modal className="show-desktop" dialogClassName="date-range-modal" size={"lg "} centered={true} show={showModel} onHide={() => {
                setShowModel
                    (false)
            }} >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <DateRangePicker
                        onChange={item => setState([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={state}
                        direction="horizontal"
                    />

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSetDateRangeClick} >
                        Next
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal className="show-mobile" dialogClassName="date-range-modal" size={"lg "} centered={true} show={showModel} onHide={() => {
                setShowModel
                    (false)
            }} >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    <DateRangePicker
                        onChange={item => setState([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={1}
                        ranges={state}
                        direction="horizontal"
                    />

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSetDateRangeClick} >
                        Next
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EcommerceDashboard;
