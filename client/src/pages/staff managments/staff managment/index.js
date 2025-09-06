import React, { useEffect } from 'react';
import {
    Row,
    Col,
    Dropdown,
    InputGroup,
    Form,
    Card,
    OverlayTrigger,
    Tooltip,
    Button,
    Table,

    Placeholder,
} from 'react-bootstrap';
// import FormInput from "../../../../components/FormInput"
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Edit from '../staff managment/Model/edit';
import './style.css';
import { MonthList, getDesignationByPost, getZoneAction } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
    activeEmployeeListAction,
    reportingManagerByDesignationAction,
    reportingManagerCreateAction,
} from '../../../redux/staffManagment/activeEmployee/actions';
import { getState, getCity } from '../../../redux/setting/action';
import MainLoader from '../../../components/MainLoader';
import Create from './Model/create';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
function UploadStaffManagmentPage() {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isModelShow, setIsModelSHow] = useState(false);
    const [mode, setMode] = useState('active');
    const [employeedata, setEmployeeData] = useState([]);
    const [leftEmployeeData, setLeftEmployeeData] = useState([]);
    const [skip, setSkip] = useState(1);
    const [leftSkip, setLeftSkip] = useState(1);
    const [editData, setEditData] = useState('');
    const [showCreateModel, setShowCreateModel] = useState(false);
    const employeeListLoader = store?.ActiveEmployeeListReducer;

    const toggleSortDropDown = () => {
        setIsSortDropdownOpen(!isSortDropdownOpen);
    };
    const handleModal = (data) => {
        setIsModelSHow(data);
    };
    const handleCreateModel = (value) => {
        setShowCreateModel(value);
    };
    const handleEdit = (ele) => {
        let body = {
            designationId: ele?.rmId?.designation?._id ? ele?.rmId?.designation?._id : '',
            zoneId: ele?.zoneId?._id
        }
        dispatch(reportingManagerByDesignationAction(body));
        setEditData(ele);
        setTimeout(() => {
            setIsModelSHow(true);

        }, 1000);
    };
    const truncate = (str, length) => {
        if (str.length > length) {
            return str.slice(0, length) + '...';
        } else {
            return str;
        }
    };

    const handleEmpNameShow = (ind) => {
        setEmployeeData(
            employeedata?.map((ele, index) =>
                ind == index ? { ...ele, empShow: !ele?.empShow } : { ...ele, empShow: false }
            )
        );
    };
    const handleEmpLeftNameShow = (ind) => {
        setLeftEmployeeData(
            leftEmployeeData?.map((ele, index) =>
                ind == index ? { ...ele, empShow: !ele?.empShow } : { ...ele, empShow: false }
            )
        );
    };
    const handleEmployIdShow = (ind) => {
        setEmployeeData(
            employeedata?.map((ele, index) =>
                ind == index ? { ...ele, empIdShow: !ele?.empIdShow } : { ...ele, empIdShow: false }
            )
        );
    }
    const handleLeftEmployIdShow = (ind) => {
        setLeftEmployeeData(
            leftEmployeeData?.map((ele, index) =>
                ind == index ? { ...ele, empIdShow: !ele?.empIdShow } : { ...ele, empIdShow: false }
            )
        );
    }
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value)
        dispatch(activeEmployeeListAction({ skip: value, leftSkip: leftSkip, searchkey: "" }))
        // Navigate(`/product-wise-report/${value}`,{ state: { skip:value } });   
    }
    const handleLeftPaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value)
        dispatch(activeEmployeeListAction({ skip: skip, leftSkip: value, searchkey: "" }))
        // Navigate(`/product-wise-report/${value}`,{ state: { skip:value } });   
    }
    const [search, setSearch] = useState('')
    useEffect(() => {
        dispatch(MonthList())
        dispatch(getDesignationByPost({ search: search }));
        dispatch(getZoneAction());
        dispatch(getState());
        dispatch(reportingManagerByDesignationAction({ search: search }));
        dispatch(getCity({ id: "", skip: "" }));
    }, []);

    useEffect(() => {
        dispatch(activeEmployeeListAction({ skip: skip, leftSkip: leftSkip, searchkey: "" }));

    }, [showCreateModel, isModelShow]);
    useEffect(() => {
        setEmployeeData(store?.ActiveEmployeeListReducer?.activeEmployeeList?.response?.findActiveEmp);
        setLeftEmployeeData(store?.ActiveEmployeeListReducer?.activeEmployeeList?.findLeftEmp);
    }, [store]);
    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    // useEffect(() => {
    //     dispatch(getDesignationByPost())
    // }, []);
    const handleSearchChange = (e) => {

        if (e.target.value.trim() !== "") {
            dispatch(activeEmployeeListAction({ skip: 1, leftSkip: leftSkip, searchkey: e.target.value.trim() }));
        }
        else {
            dispatch(activeEmployeeListAction({ skip: 1, leftSkip: leftSkip, searchkey: "" }));
        }
    }
    return (
        <>
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="pt-3 py-0">
                            <Row>
                                <Col xs={12}>
                                    <Row>
                                        <Col lg={12}>
                                            <Row>
                                                <Col lg={7}>
                                                    <Button
                                                        className={`${mode == 'active' ? 'employee' : ''
                                                            } employee-btn mx-0 px-3 fw-bold btn-secondary`}
                                                        onClick={() => {
                                                            setMode('active');
                                                        }}>
                                                        Active Employee
                                                    </Button>
                                                    <Button
                                                        className={`${mode == 'left' ? 'employee' : ''
                                                            } left-employee-btn mx-2 px-3 fw-bold btn-secondary`}
                                                        onClick={() => {
                                                            setMode('left');
                                                        }}>
                                                        Left Employee
                                                    </Button>
                                                </Col>
                                                <Col lg={5}>
                                                    <div className="page-title-box">
                                                        <div className='page-title-right header-title'>
                                                            <form className="d-flex text ">
                                                                <div className="app-search px-0">
                                                                    <div className=" position-relative ">
                                                                        <input onChange={handleSearchChange}
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Search "
                                                                        />
                                                                        <span className="mdi mdi-magnify search-icon"></span>
                                                                    </div>
                                                                </div>

                                                                {mode === 'active' && (

                                                                    <Button
                                                                        className="btn create-btn ms-3 pt-0 pb-0 ps-1 pe-1  btn-secondary"
                                                                        onClick={() => {
                                                                            setShowCreateModel(true);
                                                                        }}>
                                                                        <i className="uil-plus text-white"></i>
                                                                    </Button>

                                                                )}
                                                            </form>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>

                                        {mode === 'active' ? (
                                            <Col className=" table_container overflow-auto">
                                                {employeeListLoader?.loading ? (
                                                    <MainLoader />
                                                ) : (
                                                    <div className='tableactive'>
                                                        <Table width="1300px" responsive className="mb-0 mt-3 table-centered table_hoveWork" >
                                                            <thead>
                                                                <tr className="table-head text-white">
                                                                    <th width="100px" scope="" className="text-truncate ">
                                                                        Sr.No.
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate">
                                                                        Id
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate">
                                                                        Name
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate">
                                                                        Zone
                                                                    </th>

                                                                    <th width="100px" scope="" className="text-truncate">
                                                                        State
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate">
                                                                        City
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate ">

                                                                        <OverlayTrigger
                                                                            key={"top"}
                                                                            placement={"top"}
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-${"on"}`}>
                                                                                    Designation
                                                                                </Tooltip>
                                                                            }>
                                                                            <h6 className=' font-14 my-0 py-0 '> Desg.</h6>
                                                                        </OverlayTrigger>
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate ">
                                                                        <OverlayTrigger
                                                                            key={"top"}
                                                                            placement={"top"}
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-${"on"}`}>
                                                                                    Date Of Joining
                                                                                </Tooltip>
                                                                            }>
                                                                            <h6 className=' font-14 my-0 py-0 '> D.O.J</h6>
                                                                        </OverlayTrigger>
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate ">
                                                                        <OverlayTrigger
                                                                            key={"top"}
                                                                            placement={"top"}
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-${"on"}`}>
                                                                                    Reporting Manager Name
                                                                                </Tooltip>
                                                                            }>
                                                                            <h6 className=' font-14 my-0 py-0'> Rep.Mngr</h6>
                                                                        </OverlayTrigger>
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate ">
                                                                        <OverlayTrigger
                                                                            key={"top"}
                                                                            placement={"top"}
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-${"on"}`}>
                                                                                    Monthly Target
                                                                                </Tooltip>
                                                                            }>
                                                                            <h6 className=' font-14 my-0 py-0'> Mnth-Trgt</h6>
                                                                        </OverlayTrigger>
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate ">
                                                                        <OverlayTrigger
                                                                            key={"top"}
                                                                            placement={"top"}
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-${"on"}`}>
                                                                                    Yearly Target
                                                                                </Tooltip>
                                                                            }>
                                                                            <h6 className=' font-14 my-0 py-0'>Yr-Trgt</h6>
                                                                        </OverlayTrigger>
                                                                    </th>
                                                                    <th width="100px" scope="" className="text-truncate ">
                                                                        Status
                                                                    </th>
                                                                    <th
                                                                        width="100px" scope="col" active-tbody
                                                                        className="text-truncate "></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {employeedata?.length &&
                                                                    employeedata?.map((ele, index) => {
                                                                        return (
                                                                            <>
                                                                                {ele?.status && (
                                                                                    <tr key={index}>
                                                                                        <td width="100px" className="text-truncate active-tbody">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 "> {(skip - 1) * 50 + index + 1}</p>
                                                                                        </td>
                                                                                        {/* {!ele?.empIdShow? <td style={{cursor:"pointer"}}
                                                                                                className="text-truncate active-tbody"
                                                                                                onClick={()=>{handleEmployIdShow(
                                                                                                    index
                                                                                                )}}>
                                                                                                {truncate(
                                                                                                    ele?.empId,
                                                                                                   20
                                                                                                )}
                                                                                            </td>:
                                                                                            <td style={{cursor:"pointer"}}
                                                                                                className="text-truncate active-tbody"
                                                                                                onClick={()=>{handleEmployIdShow(
                                                                                                    index
                                                                                                )}}>
                                                                                                {
                                                                                                    ele?.empId
                                                                                                
                                                                                                        }
                                                                                            </td> } */}
                                                                                        {/* {!ele?.empShow ? (
                                                                                                <td style={{cursor:"pointer"}}
                                                                                                    className="text-truncate text-dark fw-bold"
                                                                                                    onClick={()=>{handleEmpNameShow(
                                                                                                        index
                                                                                                    )}}>
                                                                                                    {truncate(
                                                                                                        ele?.empName,
                                                                                                       20
                                                                                                    )}
                                                                                                </td>
                                                                                            ) : (
                                                                                                <td  style={{cursor:"pointer"}}
                                                                                                    className="text-truncate text-dark fw-bold active-tbody"
                                                                                                    onClick={()=>{handleEmpNameShow(
                                                                                                        index
                                                                                                    )}}>
                                                                                                    {ele?.empName}
                                                                                                </td>
                                                                                            )} */}
                                                                                        <td width="100px" className="text-truncater ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">   {ele?.empId} </p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncater ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">  {ele?.empName} </p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncater ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 "> {ele?.zoneId?.zone} </p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 "> {ele?.state?.state}</p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">{ele?.city?.city}</p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">    {
                                                                                                ele?.designation?.designation
                                                                                            }</p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">{ele?.doj} </p>                                                                                            </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">{ele?.rmId?.empName}</p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">  ₹{INR_Format(ele?.mnthtarget)}</p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">₹{INR_Format(ele?.yrlytarget)}</p>
                                                                                        </td>
                                                                                        <td width="100px" className="text-truncate ">
                                                                                            <p className="text-nowrap txt_showDots staffmanagment_width my-0 ">     {ele?.status
                                                                                                ? 'active'
                                                                                                : 'left'}</p>
                                                                                        </td>
                                                                                        <td>
                                                                                            <OverlayTrigger
                                                                                                placement="bottom"
                                                                                                overlay={
                                                                                                    <Tooltip id="overlay-example">
                                                                                                        {' '}
                                                                                                        Edit{' '}
                                                                                                    </Tooltip>
                                                                                                }>
                                                                                                <button
                                                                                                    width="100px" className="border p-1 px-2 ms-3 bt_color_hover bg-white mt-1"
                                                                                                    onClick={() => {
                                                                                                        handleEdit(
                                                                                                            ele
                                                                                                        );
                                                                                                    }}>
                                                                                                    <i width="100px" className="mdi mdi-square-edit-outline "></i>
                                                                                                </button>
                                                                                            </OverlayTrigger>
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </>
                                                                        );
                                                                    })}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                )}
                                                {store?.ActiveEmployeeListReducer?.activeEmployeeList?.activeCount > 0 && <Row>
                                                    <Col lg={12} className="d-flex justify-content-end">
                                                        <Stack spacing={2}>
                                                            <Pagination
                                                                count={store?.ActiveEmployeeListReducer?.activeEmployeeList?.ActiveEmpPagination}
                                                                variant="outlined"
                                                                shape="rounded"
                                                                color="primary"
                                                                onChange={handlePaginationChange}
                                                            />
                                                        </Stack>
                                                    </Col>
                                                </Row>}
                                            </Col>



                                        ) : (

                                            // <Row className='h-100 position-relative'>
                                            <Col className=" table_container overflow-auto">
                                                <div className='tableactive'>
                                                    <Table width="1400px" responsive className="mb-0 mt-3 table-centered table_hoveWork"  >
                                                        <thead>
                                                            <tr className="table-head text-white">
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    Sr.No.
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    Id
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    Name
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    Zone
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    State
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    City
                                                                </th>
                                                                <th width="100px" scope="" className="text-truncate ">

                                                                    <OverlayTrigger
                                                                        key={"top"}
                                                                        placement={"top"}
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-${"on"}`}>
                                                                                Designation
                                                                            </Tooltip>
                                                                        }>
                                                                        <h6 className=' font-14 my-0 py-0 '> Desg.</h6>
                                                                    </OverlayTrigger>
                                                                </th>
                                                                <th width="100px" scope="" className="text-truncate ">
                                                                    <OverlayTrigger
                                                                        key={"top"}
                                                                        placement={"top"}
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-${"on"}`}>
                                                                                Date Of Joining
                                                                            </Tooltip>
                                                                        }>
                                                                        <h6 className=' font-14 my-0 py-0 '> D.O.J</h6>
                                                                    </OverlayTrigger>
                                                                </th>
                                                                <th width="100px" scope="" className="text-truncate ">
                                                                    <OverlayTrigger
                                                                        key={"top"}
                                                                        placement={"top"}
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-${"on"}`}>
                                                                                Reporting Manager Name
                                                                            </Tooltip>
                                                                        }>
                                                                        <h6 className=' font-14 my-0 py-0'> Rep.Mngr</h6>
                                                                    </OverlayTrigger>
                                                                </th>
                                                                <th width="100px" scope="" className="text-truncate ">
                                                                    <OverlayTrigger
                                                                        key={"top"}
                                                                        placement={"top"}
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-${"on"}`}>
                                                                                Monthly Target
                                                                            </Tooltip>
                                                                        }>
                                                                        <h6 className=' font-14 my-0 py-0'> Mnth-Trgt</h6>
                                                                    </OverlayTrigger>
                                                                </th>
                                                                <th width="100px" scope="" className="text-truncate ">
                                                                    <OverlayTrigger
                                                                        key={"top"}
                                                                        placement={"top"}
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-${"on"}`}>
                                                                                Yearly Target
                                                                            </Tooltip>
                                                                        }>
                                                                        <h6 className=' font-14 my-0 py-0'>Yr-Trgt</h6>
                                                                    </OverlayTrigger>
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    Status
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate ">
                                                                    Left Date
                                                                </th>
                                                                <th width="100px" scope="col" className="text-truncate "></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {leftEmployeeData?.length >= 1 &&
                                                                leftEmployeeData?.map((ele, index) => {
                                                                    return (
                                                                        <>
                                                                            <tr key={index}>
                                                                                <td width="100px" >
                                                                                    <p className=" my-0 text-truncate text-nowrap txt_showDots staffmanagment_width"> {(leftSkip - 1) * 50 + index + 1}</p>
                                                                                </td>
                                                                                {/* {!ele?.empIdShow? <td style={{cursor:"pointer"}}
                                                                                                className="text-truncate left-tbody"
                                                                                                onClick={()=>{handleLeftEmployIdShow(
                                                                                                    index
                                                                                                )}}>
                                                                                                {truncate(
                                                                                                    ele?.empId,
                                                                                                   20
                                                                                                )}
                                                                                            </td>:
                                                                                            <td style={{cursor:"pointer"}}
                                                                                                className="text-truncate left-tbody"
                                                                                                onClick={()=>{handleLeftEmployIdShow(
                                                                                                    index
                                                                                                )}}>
                                                                                                {
                                                                                                    ele?.empId
                                                                                                
                                                                                                        }
                                                                                            </td> }
                                                                                            {!ele?.empShow ? (
                                                                                                <td style={{cursor:"pointer"}}
                                                                                                    className="text-truncate fw-bold text-dark"
                                                                                                    onClick={()=>{handleEmpLeftNameShow(
                                                                                                        index
                                                                                                    )}}>
                                                                                                    {truncate(
                                                                                                        ele?.empName,
                                                                                                       20
                                                                                                    )}
                                                                                                </td>
                                                                                            ) : (
                                                                                                <td  style={{cursor:"pointer"}}
                                                                                                    className="text-truncate fw-bold text-dark "
                                                                                                    onClick={()=>{handleEmpLeftNameShow(
                                                                                                        index
                                                                                                    )}}>
                                                                                                    {ele?.empName}
                                                                                                </td>
                                                                                            )} */}
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">  {
                                                                                        ele?.empId

                                                                                    }</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate"> {ele?.empName}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">  {ele?.zoneId?.zone}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">{ele?.state?.state}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate"> {ele?.city?.city}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">   {ele?.designation?.designation ? ele?.designation?.designation : 'N/A'}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">{ele?.doj}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">{ele?.rmId?.empName}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">  ₹ {INR_Format(ele?.mnthtarget)}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">₹  {INR_Format(ele?.yrlytarget)}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate">   {ele?.status
                                                                                        ? 'active'
                                                                                        : 'left'}</p>
                                                                                </td>
                                                                                <td width="100px" className="  text-truncate">
                                                                                    <p className=" my-0 text-nowrap txt_showDots staffmanagment_width text-truncate"> {ele?.empLeftDate}</p>
                                                                                </td>
                                                                                <td>
                                                                                    <OverlayTrigger
                                                                                        placement="bottom"
                                                                                        overlay={
                                                                                            <Tooltip id="overlay-example">
                                                                                                {' '}
                                                                                                Edit{' '}
                                                                                            </Tooltip>
                                                                                        }>
                                                                                        <button
                                                                                            className="border p-1 px-2 ms-3 bt_color_hover bg-white mt-1"
                                                                                            onClick={() => {
                                                                                                handleEdit(ele);
                                                                                            }}>
                                                                                            <i className="mdi mdi-square-edit-outline "></i>
                                                                                        </button>
                                                                                    </OverlayTrigger>
                                                                                </td>
                                                                            </tr>
                                                                        </>
                                                                    );
                                                                })}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                                {store?.ActiveEmployeeListReducer?.activeEmployeeList?.leftCount > 0 && <Row>
                                                    <Col lg={12} className="d-flex justify-content-end">
                                                        <Stack spacing={2}>
                                                            <Pagination
                                                                count={store?.ActiveEmployeeListReducer?.activeEmployeeList?.LeftEmpPagination}
                                                                variant="outlined"
                                                                shape="rounded"
                                                                color="primary"
                                                                onChange={handleLeftPaginationChange}
                                                            />
                                                        </Stack>
                                                    </Col>
                                                </Row>}
                                            </Col>
                                            // </Row>
                                        )}
                                    </Row>
                                </Col>
                            </Row>
                        </Card.Body>

                    </Card>
                </Col>
            </Row>

            <Create modelShow={showCreateModel} close={handleCreateModel} />
            <Edit modelShow={isModelShow} editData={editData} close={setIsModelSHow} />
        </>
    );
}

export default UploadStaffManagmentPage;
