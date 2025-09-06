import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { StateCreateAction } from '../../../../redux/setting/action';
import MainLoader from '../../../../components/MainLoader';
import ToastHandle from '../../../../constants/Toaster/Toaster';
function Create({ modal, closeModal }) {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const successCreateHandle = store?.StateCreateReducer
    const [value, setValue] = useState({ zone: '', state: '' });
    const [showModel, setShowModel] = useState(false);
    const [zoneList, setZoneList] = useState([]);

    const handleCloseModal = () => {
        setShowModel(false);
        closeModal();
    };

    const handleZoneChange = (e) => {
        setValue({ ...value, zone: e.target.value });
    };

    const handleStateChange = (e) => {
        setValue({ ...value, state: e.target.value.replace(/[^a-z. ]/gi, '') });
    };

    const handleAddState = () => {
        if(value.state.trim().length>0 && value.zone.trim().length>0)
        dispatch(
            StateCreateAction({
                state: value.state,
                zoneId: value.zone,
            })
        );
        else{
            ToastHandle("error","  Zone and State is required") 
        }
    };

    useEffect(() => {
       if(successCreateHandle?.status==200){
        setValue({zone:"",state:""})
        setShowModel(false);
        closeModal("render");
        ToastHandle("success","Successfully Created 👍")
       }
       else if(successCreateHandle?.status==400) {
        setShowModel(false);
        closeModal();
        ToastHandle("error",successCreateHandle?.message)
       }
       else{
        setValue({zone:"",state:""})
        setShowModel(false);
        closeModal();
       }
    }, [successCreateHandle]);
    useEffect(() => {
        setShowModel(modal);
        setZoneList(store?.getZoneListReducer?.getDesignation?.response);
    }, [modal]);

    return (
        <>
            <Modal xs={9} onHide={handleCloseModal} show={showModel}>
                <Modal.Body>
                   {successCreateHandle?.loading?<MainLoader/>: <>
                        <Col className="text-end" lg={12}>
                            <CloseButton onClick={handleCloseModal} />
                        </Col>
                        <Row>
                            <Col className="mt-2" lg={12}>
                                <Form.Group>
                                    <Row>
                                        <Col className="text-xenter mt-1" lg={4}>
                                            <Form.Label className=""> Select Zone:</Form.Label>
                                        </Col>
                                        <Col lg={8}>
                                            <Form.Select value={value?.zone} onChange={handleZoneChange}>
                                                <option value=" "> --Select-- </option>
                                                {zoneList?.map((ele, ind) => {
                                                    return <option key = {ind} value={ele?._id}>{ele?.zone} </option>;
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Row className=" mt-2">
                                        <Col className="text-xenter mt-1" lg={4}>
                                            <Form.Label className="">Enter state :</Form.Label>
                                        </Col>
                                        <Col lg={8}>
                                            <Form.Group className="">
                                                <Form.Control
                                                    value={value.state}
                                                    onChange={handleStateChange}
                                                    type="text"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Col className="text-end mt-2">
                            <Button onClick={handleAddState}>Add</Button>{' '}
                        </Col>
                    </>}
                    </Modal.Body>
            </Modal>
        </>
    );
}
export default Create;
