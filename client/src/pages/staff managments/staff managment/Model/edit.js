import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import Modal from 'react-bootstrap/Modal';
import { Row, Col, Form, Card, } from 'react-bootstrap';
import { CloseButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import ToastHandle from '../../../../constants/Toaster/Toaster';
import { activeEmployeeUpdateAction, getDesignationByPost } from '../../../../redux/actions';
import { reportingManagerByDesignationAction } from '../../../../redux/actions';
import MainLoader from '../../../../components/MainLoader';
function Edit({ modelShow, editData, close }) {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const dispatch = useDispatch()
    const store = useSelector((state) => state)
    const [showModel, setShowModel] = useState(false)
    const [data, setdata] = useState({ zone: "", status: editData?.status, state: "" })
    const [vicePresident, setVicePresident] = useState(false)
    const [stateData, setstateData] = useState([])
    const [cityData, setCityData] = useState([])
    const [IsleftEmployee, setIsLeftEmployee] = useState(false)
    const updateLoader = store?.ActiveEmployeeUpdateReducer
    const successHandle = store?.ActiveEmployeeUpdateReducer?.status
    const errorHandle = store?.ActiveEmployeeUpdateReducer?.status
    const handleZoneChange = (e) => {
        setdata({ ...data, zone: e.target.value })
        setstateData(store?.getStateReducer?.data?.response?.filter((ele) => ele?.zoneId == e.target.value))
    }

    const handleStateChange = (e) => {
        setdata({ ...data, state: e.target.value })
        setCityData(store?.getCityReducer?.data?.response?.filter((ele) => ele?.stateId?._id == e.target.value))
    }
    const handleStatusChange = (e) => {
        if (e.target.value == "left") {
            setdata({ ...data, status: false, statusValue: e.target.value })
            setIsLeftEmployee(true)
        }
        else {
            setdata({ ...data, status: true, statusValue: e.target.value })
            setIsLeftEmployee(false)
        }
    }
    const handleReset = () => {
        reset()
    }


    useEffect(() => {
        if (modelShow) {

            setstateData(store?.getStateReducer?.data?.response?.filter((ele) => ele?.zoneId == editData?.zoneId?._id))
            setCityData(store?.getCityReducer?.data?.response?.filter((ele) => ele?.stateId?._id == editData?.state?._id))
        }
    }, [modelShow])


    useEffect(() => {

        setdata({ ...data, status: editData?.status })
        reset({
            employeeId: editData?.empId,
            name: editData?.empName,
            designation: editData?.designation?._id ? editData?.designation?._id : '',
            dateofJoining: editData?.doj,
            zone: editData?.zoneId?._id,
            // reportingManager: editData?.rmId?.designation?._id,
            reportingManagerName: editData?.rmId?._id ? editData?.rmId?._id : '',
            status: editData?.status ? "active" : "left",
            statusValue: editData?.status ? "active" : "left",
            monthlyTarget: editData?.mnthtarget ? editData?.mnthtarget : "",
            yearlyTarget: editData?.yrlytarget ? editData?.yrlytarget : "",
            state: editData?.state?._id,
            city: editData?.city?._id,
            leftDate: editData?.empLeftDate,
        })
    }, [modelShow])

    console.log(editData, "0000008888");
    useEffect(() => {
        if (editData?.designation?.designation == "VICE PRESIDENT") {
            setVicePresident(true)
        }
        else {
            setVicePresident(false)
        }
        let body = {
            designationId: editData?.rmId?.designation?._id,
            zoneId: editData?.zoneId?._id
        }
        // dispatch(reportingManagerByDesignationAction(body))
        setdata({ ...data, zone: editData?.zoneId?._id, })
    }, [modelShow])

    const onSubmit = (data) => {
        let body = {
            employId: editData?._id,
            empId: data?.employeeId,
            empName: data?.name,
            designation: data?.designation,
            joinDate: data?.dateofJoining,
            zoneId: data?.zone,
            rmId: data?.reportingManagerName,
            status: data?.status == "active" ? true : false,
            mnthtarget: data?.monthlyTarget ? data?.monthlyTarget : "",
            yrlytarget: data?.yearlyTarget ? data?.yearlyTarget : "",
            state: data?.state,
            city: data?.city,
            empLeftDate: data?.status == "active" ? " " : data?.leftDate,
        }
        dispatch(activeEmployeeUpdateAction(body))
    }

    const handleReporitingManager = (e) => {
        let daata = {
            designationId: e.target.value,
            zoneId: data?.zone
        }
        dispatch(reportingManagerByDesignationAction(daata))
    }

    useEffect(() => {
        if (successHandle == 200) {
            ToastHandle("success", "successfully Updated")
            close(false)
            reset()
        }
        else if (errorHandle == 401) {
            ToastHandle("error", store?.ActiveEmployeeUpdateReducer?.message)
        }
        else if (errorHandle == 405) {
            ToastHandle("error", "Something went wrong")
        }
    }, [successHandle, errorHandle])

    console.log(store, "999999");
    return (
        <>
            <Modal xs={9} size={"xl "} onHide={() => {
                reset()
                close(false)
            }} show={modelShow} dialogClassName="modal-width"
            >
                <Modal.Body className='pb-2' >

                    <Row >
                        <Col className="text-end" lg={12}>
                            <Row>
                                <Col className='text-start' lg={6}>
                                    <h3 className='ms-4'>Edit Employee </h3>
                                </Col>
                                <Col className='text-end' lg={6}>
                                    <CloseButton onClick={() => {
                                        close(false)
                                    }} />
                                </Col>
                            </Row>

                        </Col>
                        <Col xs={12}>
                            <Card>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Card.Body className='pb-0'>
                                        {updateLoader?.loading ? <MainLoader /> : <Row className='p-3 pb-2'>
                                            <Col xs={12} >
                                                <Row className="my-1">
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className='' >
                                                                        Employee id <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Control
                                                                            type="text"  {...register("employeeId", {
                                                                                required: true,
                                                                                pattern: {
                                                                                    value: /^[a-z0-9 ]*$/,
                                                                                    message: "Only Alphabets and numbers are allowed",
                                                                                }
                                                                            })}
                                                                        />
                                                                        {errors?.employeeId?.type == "required" && <span className="text-danger"> This field is required *</span>}
                                                                        {errors?.employeeId?.type == "pattern" && <span className="text-danger"> {errors?.employeeId?.message}</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label>
                                                                        Employee Name <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Control {...register("name", {
                                                                            required: true,
                                                                            pattern: {
                                                                                value: /^[a-zA-Z ]*$/,
                                                                                message: "Only Alphabets are allowed",
                                                                            }
                                                                        })}
                                                                            type="text"
                                                                        />
                                                                        {errors?.name?.type == "required" && <span className="text-danger"> This field is required *</span>}
                                                                        {errors?.name?.type == "pattern" && <span className="text-danger"> {errors?.name?.message}</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row className="my-1">
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        Zone <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Select disabled={vicePresident}
                                                                        {...register("zone", { required: !vicePresident })}
                                                                        onChange={handleZoneChange}
                                                                    >
                                                                        <option>---select---</option>
                                                                        {store?.getZoneListReducer?.getDesignation?.response?.map((ele, ind) => {
                                                                            return (

                                                                                <option key={ind} value={ele?._id}> {ele?.zone} </option>
                                                                            )
                                                                        })}

                                                                    </Form.Select>
                                                                    {errors?.zone && <span className="text-danger"> This field is required *</span>}
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        State <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Select disabled={vicePresident}
                                                                            {...register("state", { required: !vicePresident })}
                                                                            onChange={handleStateChange}
                                                                        >
                                                                            <option value="">--Select---</option>
                                                                            {stateData?.map((ele, ind) => {
                                                                                return (

                                                                                    <option key={ele?._id} value={ele?._id}>{ele?.state} </option>

                                                                                )
                                                                            })}
                                                                        </Form.Select>
                                                                        {errors?.state && <span className="text-danger"> This field is required *</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row className="my-1">
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        City <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Select {...register("city", { required: !vicePresident })}
                                                                            disabled={vicePresident}
                                                                        >
                                                                            <option>--select</option>
                                                                            {cityData?.map((ele, ind) => {
                                                                                return (

                                                                                    <option key={ele?._id} value={ele?._id}>{ele?.city} </option>

                                                                                )
                                                                            })}
                                                                        </Form.Select>
                                                                        {errors?.city && <span className="text-danger"> This field is required *</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        Designation <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Select {...register("designation", { required: true })}
                                                                        >{store?.GetDesignationReducer?.getDesignation?.response?.map((ele, ind) => {
                                                                            <option>---select---</option>
                                                                            return (

                                                                                <option key={ele?._id} value={ele?._id}>{ele?.designation} </option>
                                                                            )
                                                                        })}
                                                                        </Form.Select>
                                                                        {errors?.designation && <span className="text-danger"> This field is required *</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                                {/* <Form.Group className="" >
                                                                    <Form.Select {...register("reportingManagerName", { required: !vicePresident })}
                                                                        type="text" disabled={vicePresident}
                                                                    >
                                                                        <option>---select---</option>
                                                                        {store?.ReportingManagerByDesignationReducer?.response?.length > 0 && store?.ReportingManagerByDesignationReducer?.response?.map((ele, ind) => {
                                                                            return (
                                                                                <option value={ele?._id}> 
                                                                                </option>
                                                                            )
                                                                        })}

                                                                    </Form.Select> */}
                                                            </Row>
                                                        </Form.Group>

                                                    </Col>
                                                </Row>

                                                <Row className="my-1">
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label>
                                                                        Date of Joining <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Control {...register("dateofJoining", { required: true })}
                                                                            type="Date"
                                                                        />
                                                                        {errors?.dateofJoining && <span className="text-danger"> This field is required *</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>

                                                    </Col>
                                                    {/* <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        Reporting Manager <span className="text-danger">*</span> :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className=""  >
                                                                        <Form.Select disabled={vicePresident}
                                                                            {...register("reportingManager", { required: !vicePresident })}
                                                                            onChange={(e) => handleReporitingManager(e)}

                                                                        >
                                                                            <option>--select--</option>
                                                                            {store?.GetDesignationReducer?.getDesignation?.response?.map((ele, ind) => {
                                                                                return (

                                                                                    <option key={ele?._id} value={ele?._id}  >{ele?.designation} </option>

                                                                                )
                                                                            })}
                                                                        </Form.Select>
                                                                        {errors?.reportingManager && <span className="text-danger"> This field is required *</span>}
                                                                    </Form.Group>
                                                                </Col>

                                                            </Row>
                                                        </Form.Group>

                                                    </Col> */}

                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''  >
                                                                        Reporting Manager Name:
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Select {...register("reportingManagerName", { required: !vicePresident })}
                                                                            type="text" disabled={vicePresident}
                                                                        >
                                                                            <option>---select---</option>
                                                                            {store?.ReportingManagerByDesignationReducer?.response?.length > 0 && store?.ReportingManagerByDesignationReducer?.response?.map((ele, ind) => {
                                                                                return (
                                                                                    <option key={ele?._id} value={ele?._id}> {ele?.empName}
                                                                                        {/* {`(${ele?.designation?.designation})`} */}
                                                                                    </option>
                                                                                )
                                                                            })}

                                                                        </Form.Select>
                                                                        {errors?.reportingManagerName && <span className="text-danger"> This field is required *</span>}
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row className="my-1">

                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''  >
                                                                        Monthly Target  :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Control {...register("monthlyTarget", { required: false })}
                                                                            type="number"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>
                                                    </Col>
                                                    {!data?.status && <Col lg={6}>

                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        Left Date  :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Control  {...register("leftDate", { required: false })} disabled={vicePresident}
                                                                        type='date'
                                                                    />
                                                                    {errors?.leftDate && <span className="text-danger"> This field is required *</span>}
                                                                </Col>
                                                            </Row>

                                                        </Form.Group>
                                                    </Col>}
                                                </Row>
                                                <Row className='my-1'>
                                                    <Col lg={6}>
                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label>
                                                                        Year Target  :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className="" >
                                                                        <Form.Control  {...register("yearlyTarget", { required: false })}

                                                                            type="number"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </Form.Group>

                                                    </Col>
                                                    <Col lg={6}>

                                                        <Form.Group >
                                                            <Row className="d-flex align-items-center">
                                                                <Col lg={12}>
                                                                    <Form.Label className=''>
                                                                        Status :
                                                                    </Form.Label>
                                                                </Col>
                                                                <Col lg={12}>
                                                                    <Form.Group className=""  >
                                                                        <Form.Select  {...register("status", { required: false })}
                                                                            disabled={vicePresident}
                                                                            onChange={handleStatusChange}

                                                                        >
                                                                            <option value=" "> --Select-- </option>
                                                                            <option value="active">Active Employee </option>
                                                                            <option value="left">Left Employee</option>

                                                                        </Form.Select>


                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>

                                                        </Form.Group>
                                                    </Col>

                                                </Row>
                                                <Row>
                                                    <Col lg={12} className="text-center  mt-4">
                                                        <button type="submit" className="btn submit-btn text-white" ><span className=''>Update</span></button>

                                                        <button type="reset" className="btn reset-btn ms-3 btn-secondary" onClick={handleReset} ><span className=' text-black'>Reset</span></button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>}
                                    </Card.Body>
                                </Form>
                            </Card>
                        </Col>
                    </Row>

                </Modal.Body>
            </Modal>
        </>
    )
}

export default Edit
