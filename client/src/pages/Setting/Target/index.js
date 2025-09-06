import React from 'react'
import { Button } from 'react-bootstrap'
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { useState, useEffect } from 'react'
import Create from './Model/create';
import { MonthList } from '../../../redux/month/actions';
import { useSelector, useDispatch } from 'react-redux';
import { createProjectionAction, getProjectionAction, updateProjectionAction,getFullMonths } from '../../../redux/setting/action';
import MainLoader from '../../../components/MainLoader';
import Update from './Model/update';
import "../../staff managments/staff managment/style.css"
import { activeEmployeeListAction } from '../../../redux/actions';
import EmployeeTargetUpdate from './Model/employeeTargetUpdate';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

function Target() {
    const dispatch = useDispatch()
    const [updatedStateValue, setUpdatedStateValue] = useState("")
    const [updatedValue, setUpdatedValue] = useState("")
    const [updateStateModel, setUpdateStateModel] = useState(false);
    const [updateEmployeeModel, setupdateEmployeeModel] = useState(false);
    const [mode, setMode] = useState('Organization');
    const [employeedata, setEmployeeData] = useState([]);
    const store = useSelector((state) => state)
    const [openProjectionModel, setOpenProjectionModel] = useState(false)
    const [render, setRender] = useState(false)
    const [renderr, setRenderr] = useState(false)
    const [skip,setSkip] = useState(1);
    const [leftSkip,setLeftSkip] = useState(1);
    const handleUpdateState = (data) => {
        setUpdatedStateValue(data);
        setUpdateStateModel(true);
    };
    const handleUpdateEmployee = (data) => {
        setUpdatedValue(data);
        setupdateEmployeeModel(true);
    };
    const hanldeProjection = () => {
        setOpenProjectionModel(true)
    }
    const closeProjectionModal = (data) => {
        if (data == "render") {
            setRender(!render)
        }
        setOpenProjectionModel(false)
    }
    const closeupdateStateModal = (data) => {
        if (data == 'render') {
            setRender(!render);
        }
        setUpdateStateModel(false);
    };
    const closeupdateModal = (data) => {
        if (data == 'renderr') {
            setRenderr(!renderr);
        }
        setupdateEmployeeModel(false);
    };
    const truncate = (str, length) => {
        if (str.length > length) {
            return str.slice(0, length) + '...';
        } else {
            return str;
        }
    };
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number)=>{
        setSkip(value)
        dispatch(activeEmployeeListAction({ skip:value,leftSkip:leftSkip,searchkey:"" }))
        // Navigate(`/product-wise-report/${value}`,{ state: { skip:value } });   
    }
    const handleEmployIdShow = (ind) => {
        setEmployeeData(
            employeedata?.map((ele, index) =>
                ind == index ? { ...ele, empIdShow: !ele?.empIdShow } : { ...ele, empIdShow: false }
            )
        );
    }
    const handleEmpNameShow = (ind) => {
        setEmployeeData(
            employeedata?.map((ele, index) =>
                ind == index ? { ...ele, empShow: !ele?.empShow } : { ...ele, empShow: false }
            )
        );
    };
    const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    useEffect(() => {
        dispatch(getFullMonths())
        dispatch(MonthList())
        dispatch(getProjectionAction())
        dispatch(activeEmployeeListAction({  skip:1,  leftSkip:1 , searchkey:""}));
    }, [render])
    useEffect(() => {
        setEmployeeData(store?.ActiveEmployeeListReducer?.activeEmployeeList?.response?.findActiveEmp);

    }, [store]);
    return (
        <>
            <Card>
                {store?.GetProjectionReducer?.loading ? <MainLoader /> : <Card.Body>
                    <Row>
                        <Col lg={12}>
                            <Row>
                                <Col className="text-start" lg={6}>
                                                <Button
                                                    className={`${mode == 'Organization' ? 'employee' : ''
                                                        } employee-btn  fw-bold btn-secondary text-nowrap `}
                                                    onClick={() => {
                                                        setMode('Organization');
                                                    }}>
                                                    Organization Target
                                                </Button>
                                            
                                            
                                                <Button
                                                    className={`${mode == 'Employee' ? 'employee' : ''
                                                        } left-employee-btn  fw-bold btn-secondary text-nowrap ms-2`}
                                                    onClick={() => {
                                                        setMode('Employee');
                                                    }}>
                                                    Employee Target
                                                </Button>
                                </Col>
                                {mode === 'Organization' && (<Col className="text-end" lg={6}>
                                    <Button className=' rounded-pill' onClick={hanldeProjection}>Create Target</Button>
                                </Col>)}
                            </Row>

                        </Col>
                    </Row>


                    {mode === 'Organization' ? (
                        <Table className="table-centered mb-0 mt-2">
                            <thead className="table-dark">
                                <tr>
                                    <th>Sr no.</th>
                                    <th> Month </th>
                                    <th> Year</th>
                                    <th> Amount</th>
                                    <th> Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {store?.GetProjectionReducer?.data?.response?.map((ele, index) => {
                                    return (
                                        <tr key={index}>
                                            <td scope="row">{index + 1}</td>
                                            <td>{ele?.month.month}</td>
                                            <td>{ele?.year}</td>
                                            <td>₹{INR_Format(ele?.trgtAmt)}</td>


                                            <td>
                                                {' '}
                                                <>
                                                    {' '}
                                                    <i style={{ cursor: "pointer" }} onClick={() => handleUpdateState(ele)} className="dripicons-document-edit"></i>
                                                </>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    ) : (
                        <Table className="table-centered mb-0 mt-2">
                            <thead className="table-dark">
                                <tr>
                                    <th>Sr no.</th>
                                    <th>Id</th>
                                    <th> Name </th>
                                    <th>Zone</th>
                                    <th> Monthly Target</th>
                                    <th> Yearly Target</th>
                                    <th> Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeedata?.map((ele, index) => {
                                    return (
                                        <tr key={index}>
                                            <td scope="row">{(skip-1)*50 + index + 1}</td>
                                            {!ele?.empIdShow ? <td style={{ cursor: "pointer" }}
                                                className="text-truncate pt-3 pb-3 active-tbody"
                                                onClick={() => {
                                                    handleEmployIdShow(
                                                        index
                                                    )
                                                }}>
                                                {truncate(
                                                    ele?.empId,
                                                    20
                                                )}
                                            </td> :
                                                <td style={{ cursor: "pointer" }}
                                                    className="text-truncate pt-3 pb-3 active-tbody"
                                                    onClick={() => {
                                                        handleEmployIdShow(
                                                            index
                                                        )
                                                    }}>
                                                    {
                                                        ele?.empId

                                                    }
                                                </td>}
                                            {!ele?.empShow ? (
                                                <td style={{ cursor: "pointer" }}
                                                    className="text-truncate text-dark fw-bold pt-3 pb-3"
                                                    onClick={() => {
                                                        handleEmpNameShow(
                                                            index
                                                        )
                                                    }}>
                                                    {truncate(
                                                        ele?.empName,
                                                        20
                                                    )}
                                                </td>
                                            ) : (
                                                <td style={{ cursor: "pointer" }}
                                                    className="text-truncate text-dark fw-bold pt-3 pb-3 active-tbody"
                                                    onClick={() => {
                                                        handleEmpNameShow(
                                                            index
                                                        )
                                                    }}>
                                                    {ele?.empName}
                                                </td>
                                            )}
                                            <td> {ele?.zoneId?.zone}</td>
                                            <td>₹{INR_Format(ele?.mnthtarget)}</td>
                                            <td>₹{INR_Format(ele?.yrlytarget)}</td>


                                            <td>
                                                {' '}
                                                <>
                                                    {' '}
                                                    <i style={{ cursor: "pointer" }} onClick={() => handleUpdateEmployee(ele)} className="dripicons-document-edit"></i>
                                                </>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                                                       {store?.ActiveEmployeeListReducer?.activeEmployeeList?.activeCount>0 &&<Row>
    <Col  lg={12} className="d-flex justify-content-end">
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
               
                </Card.Body>}
                <Create modal={openProjectionModel} closeModal={closeProjectionModal} />
            <Update modal={updateStateModel} closeModal={closeupdateStateModal} data={updatedStateValue} />
            <EmployeeTargetUpdate modal={updateEmployeeModel} closeModal={closeupdateModal} data={updatedValue}/>
            </Card>
            
        </>
    )
}
export default Target;