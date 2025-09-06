import React from 'react';
import { Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useSelector,useDispatch } from 'react-redux';
import { createZoneAction } from '../../../../redux/setting/action';
import ToastHandle from '../../../../constants/Toaster/Toaster';
import MainLoader from '../../../../components/MainLoader';

function Create({ modal, closeModal }) {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const success = store?.createZoneReducer
    const [data, setData] = useState({ zone:"" });
    const [showZonenModel, setShowZoneModel] = useState(false);
    
    const handelzone = (e) => {
        setData({ ...data, zone: e.target.value.replace(/[^a-z. ]/gi, '') });
    };
   
    const handleCloseModal = () => {
        setShowZoneModel(false);
        closeModal();
    };

    const handleCreate = () => {
        if( data?.zone.trim()!=='')
        {
            dispatch(createZoneAction({zone:data?.zone}));
        }
        else{
            ToastHandle("error","Zone is required") 
        }
    };
    useEffect(() => {
        setShowZoneModel(modal);
    }, [modal]);

    useEffect(() => {
     if(success.data?.status==200){
        ToastHandle("success","Successfully created 👍")
        setData({ zone:'' })
        setShowZoneModel(false);
        closeModal("render");
     }
     else if(success.data?.status==400){
        setShowZoneModel(false)
        closeModal("")
        ToastHandle("error",success?.data?.message)
        setData({ zone:'' })
      }
     else{
        setShowZoneModel(false);
        closeModal();
     }
    }, [success])
    
//     useEffect(()=>{
// dispatch(())
//     }[])

    return (
        <>
                            <Modal xs={9} onHide={handleCloseModal} show={showZonenModel}>
                                <Modal.Body>
                                   {success?.loading?<MainLoader/>: <>
                                        <Col className="text-end" lg={12}>
                                            <CloseButton onClick={handleCloseModal} />
                                        </Col>
                                        <Row>
                                            <Col className="mt-2" lg={12}>
                                                <Form.Group>
                                                    <Row className="mt-2">
                                                        <Col className="text-xenter mt-1" lg={4}>
                                                            <Form.Label className="">Create Zone :</Form.Label>
                                                        </Col>
                                                        <Col lg={8}>
                                                            <Form.Group
                                                                className=""
                                                              >
                                                                <Form.Control   onChange={handelzone}
                                                                value={data?.zone} type="text" />
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

