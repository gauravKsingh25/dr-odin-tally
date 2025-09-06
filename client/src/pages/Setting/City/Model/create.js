import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import MainLoader from '../../../../components/MainLoader';
import { createCity } from '../../../../redux/setting/action';
import ToastHandle from '../../../../constants/Toaster/Toaster';
function Create({ modal, close }) {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const successCreateHandle = store?.createCityReducer
    const [value, setValue] = useState({ stateId: '', city: '' });
    const [showModel, setShowModel] = useState(false);
    const [stateList, setstateList] = useState([]);

    const handleCloseModal = () => {
       setShowModel(false)
       close()
    };
    const handleCreateCity = ()=>{
        if(value.stateId !=="" && value.city.trim()!==""){
            dispatch(createCity({city:value.city,stateId:value.stateId}))
        }
        else{
        ToastHandle("error","State and City is required") 
        }
    } 

    useEffect(() => {
        setShowModel(modal)
        setstateList(store?.getStateReducer?.data?.response)
    }, [modal])
    

    useEffect(() => {
     if(successCreateHandle?.data?.status==200){
        setShowModel(false)
       close("render")
       setValue({ stateId: '', city: '' })
        ToastHandle("success","Successfully Created 👍")
     }
     else if(successCreateHandle?.data?.status==400){
        setShowModel(false)
       close("")
        ToastHandle("error","Something Went Wrong 😔")
        setValue({ stateId: '', city: '' })
     }
     else if(successCreateHandle?.status==400){
        setShowModel(false)
       close("")
        ToastHandle("error","Already Exist😔")
        setValue({ stateId: '', city: '' })
     }
     else{
        // setValue({ stateId: '', city: '' })
        setShowModel(false)
        close()
     }
    }, [successCreateHandle])
    
    

  

    return (
        <>
            <Modal xs={9} onHide={handleCloseModal} show={showModel}>
                <Modal.Body>
                 {successCreateHandle?.loading?<MainLoader/>:<>
                        <Col className="text-end" lg={12}>
                            <CloseButton onClick={handleCloseModal} />
                        </Col>
                        <Row>
                            <Col className="mt-2" lg={12}>
                                <Form.Group>
                                    <Row>
                                        <Col className="text-xenter mt-1" lg={4}>
                                            <Form.Label className=""> Select State:</Form.Label>
                                        </Col>
                                        <Col lg={8}>
                                            <Form.Select value={value?.stateId} onChange = {(e)=>{setValue({...value,stateId:e.target.value})}} >
                                                <option value=" "> --Select-- </option>
                                                {stateList?.map((ele, ind) => {
                                                    return <option key = {ind} value={ele?._id}>{ele?.state} </option>;
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Row className=" mt-2">
                                        <Col className="text-xenter mt-1" lg={4}>
                                            <Form.Label className="">Enter City :</Form.Label>
                                        </Col>
                                        <Col lg={8}>
                                            <Form.Group className="">
                                                <Form.Control pattern='/[^a-z]/gi' onChange = {(e)=>{setValue({...value,city:e.target.value.replace(/[^a-z. ]/gi, '')})}}
                                                   value={value.city}
                                                    type="text"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Col className="text-end mt-2">
                            <Button onClick={handleCreateCity}>Add</Button>{' '}
                        </Col>
                        </>}
                </Modal.Body>
            </Modal>
        </>
    );
}
export default Create;
