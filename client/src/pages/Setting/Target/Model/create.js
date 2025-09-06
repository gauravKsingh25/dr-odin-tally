import React from 'react';
import { Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useSelector,useDispatch } from 'react-redux';
import { createProjectionAction } from '../../../../redux/setting/action';
import ToastHandle from '../../../../constants/Toaster/Toaster';
import MainLoader from '../../../../components/MainLoader';

function Create({ modal, closeModal }) {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const success = store?.CreateProjectionReducer
    const [data, setData] = useState({ month: '', ammount: '', yearvalue: '' });
    const [showProjectionModel, setShowProjectionModel] = useState(false);
    const handelmonth = (e) => {
        setData({ ...data, month: e.target.value });
    };
    const handelammount = (e) => {
        setData({ ...data, ammount: e.target.value });
    };
    const handelyear = (e) => {
        setData({ ...data, yearvalue: e.target.value });
    };
    const handleCloseModal = () => {
        setShowProjectionModel(false);
        closeModal();
    };

    const handleCreate = () => {
        if( data?.yearvalue!=='' &&data?.month!=='' &&data?.ammount.trim()!=='')
        {
            dispatch(createProjectionAction({year:data?.yearvalue,month:data?.month,amount:data?.ammount}));
        }
        else{
            ToastHandle("error","All fields are required") 
        }
    };
    useEffect(() => {
        setShowProjectionModel(modal);
    }, [modal]);

    useEffect(() => {
     if(success.status==200){
        ToastHandle("success","Successfully created 👍")
        setData({ month: '', ammount: '', yearvalue: '' })
        setShowProjectionModel(false);
        closeModal("render");
     }
     else if (success.status==400){
        ToastHandle("error",success?.message)
        setData({ month: '', ammount: '', yearvalue: '' })
        setShowProjectionModel(false);
     }
     else{
        setShowProjectionModel(false);
        closeModal();
     }
    }, [success])
    

    return (
        <>
                            <Modal xs={9} onHide={handleCloseModal} show={showProjectionModel}>
                                <Modal.Body>
                                   {success?.loadin?<MainLoader/>: <>
                                        <Col className="text-end" lg={12}>
                                            <CloseButton onClick={handleCloseModal} />
                                        </Col>
                                        <Row>
                                            <Col className="mt-2" lg={12}>
                                                <Form.Group>
                                                    <Row>
                                                        <Col className="text-xenter mt-1" lg={4}>
                                                            <Form.Label className="">Select Year :</Form.Label>
                                                        </Col>
                                                        <Col lg={8}>
                                                            <Form.Group
                                                                className=""
                                                                onChange={handelyear}
                                                                value={data?.yearvalue}>
                                                                <Form.Control type="number"  min="2023" max="2099" step="1"/>

                                                                {/* </Form.Control> */}
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-2">
                                                        <Col className="text-xenter mt-1" lg={4}>
                                                            <Form.Label className="">Select Month :</Form.Label>
                                                        </Col>
                                                        <Col lg={8}>
                                                            <Form.Select
                                                                className=""
                                                                onChange={handelmonth}
                                                                value={data?.month}>
                                                                <option value=""> --Select-- </option>
                                                                {store?.MonthListReducer?.MonthList?.response?.map(
                                                                    (ele, ind) => {
                                                                        return (
                                                                            <option key = {ind} value={ele?._id}>
                                                                                {ele?.month}{' '}
                                                                            </option>
                                                                        );
                                                                    }
                                                                )}
                                                            </Form.Select>
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-2">
                                                        <Col className="text-xenter mt-1" lg={4}>
                                                            <Form.Label className="">Enter Amount :</Form.Label>
                                                        </Col>
                                                        <Col lg={8}>
                                                            <Form.Group
                                                                className=""
                                                                onChange={handelammount}
                                                                value={data?.ammount}>
                                                                <Form.Control type="number" />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Col className="text-end mt-2">
                                            <Button onClick={handleCreate}>Add</Button>{' '}
                                        </Col>
                                    </>}
                      
                                </Modal.Body>
                            </Modal>
        </>
    );
}
export default Create;
