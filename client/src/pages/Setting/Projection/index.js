import React from 'react'
import { Button } from 'react-bootstrap'
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { useState, useEffect } from 'react'
import Create from '../Projection/Model/Create';
import { MonthList } from '../../../redux/month/actions';
import { useSelector, useDispatch } from 'react-redux';
import { createProjectionAction, getProjectionAction, updateProjectionAction } from '../../../redux/setting/action';
import MainLoader from '../../../components/MainLoader';
import Update from './Model/Update';

function Projection() {
    const dispatch = useDispatch()
    const [updatedStateValue, setUpdatedStateValue] = useState("")
    const [updateStateModel, setUpdateStateModel] = useState(false);
   
    const store = useSelector((state) => state)
    const [openProjectionModel, setOpenProjectionModel] = useState(false)
    const [render, setRender] = useState(false)
    const handleUpdateState = (data) => {
        setUpdatedStateValue(data);
        setUpdateStateModel(true);
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
    useEffect(() => {

        dispatch(MonthList())
        dispatch(getProjectionAction()) 
    }, [render])
    return (
        <>
            <Card>
                {store?.GetProjectionReducer?.loading?<MainLoader/>:<Card.Body>
                    <Row>
                        <Col lg={12}>
                            <Button className=' rounded-pill' onClick={hanldeProjection}>Create Target</Button>
                        </Col>
                    </Row>



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
                                        <td>{ele?.trgtAmt}</td>


                                        <td>
                                            {' '}
                                            <>
                                                {' '}
                                                <i style={{ cursor: "pointer" }} onClick={()=>handleUpdateState(ele)} className="dripicons-document-edit"></i>
                                            </>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>}
            </Card>
            <Create modal={openProjectionModel} closeModal={closeProjectionModal} />
            <Update modal={updateStateModel} closeModal={closeupdateStateModal} data = {updatedStateValue} />


        </>
    )
}
export default Projection