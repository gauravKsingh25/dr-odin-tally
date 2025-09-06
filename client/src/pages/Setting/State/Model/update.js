import React,{useState,useEffect} from 'react'
import { Button } from 'react-bootstrap'
import { Card,Row,Col,CloseButton,Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch,useSelector } from 'react-redux';
import { updateState } from '../../../../redux/setting/action';
import MainLoader from '../../../../components/MainLoader';
import ToastHandle from '../../../../constants/Toaster/Toaster';
function Update({modal,closeModal,data}){
    const dispatch= useDispatch()
    const store = useSelector((state)=>state)
    const SuccessUpdateState = store?.UpdateStateReducer
    const [value,setValue] = useState({state:"",updatedState:"",zone:"",zoneId:""})
    const [updateModal,setUpdateModalModal] = useState(false)
    const [zoneList, setZoneList] = useState([]);
    const handleZoneChange = (e) => {
      setValue({ ...value, zone: e.target.value });
  };


    const handleModalClose = ()=>{
        setUpdateModalModal(false)
        closeModal()
    }
    const handleUpdatedState = (e)=>{
        setValue({...value,updatedState:e.target.value.replace(/[^a-z. ]/gi, '')})
    } 
    const handleUpdate = ()=>{
    if(value?.updatedState.trim()!==''){
      dispatch(updateState({state:value?.updatedState,id:data?._id,zoneId:value?.zone,id:data?._id}))
      
    }
      else{
        ToastHandle('error',"State can't be empty")
      }  
    }


    useEffect(()=>{
       setValue({...value,state:data?.state,zone:data?.zoneId})
        setUpdateModalModal(modal)
    },[modal])

    useEffect(() => {
      if(SuccessUpdateState?.data?.status==200){
        setValue({...value,updatedState:""})
        setUpdateModalModal(false)
        closeModal("render")
        ToastHandle("success","Updated Successfully 👍")
      }
      else if(SuccessUpdateState?.data?.status==400){
        setUpdateModalModal(false)
        closeModal("")
        ToastHandle("error","Not Updated 😔")
      }
      else{
        setValue({...value,updatedState:""})
        setUpdateModalModal(false)
        closeModal()
       
      }
    }, [SuccessUpdateState])
    useEffect(() => {
     
      setZoneList(store?.getZoneListReducer?.getDesignation?.response);
  }, [store]);

return(
    <>
     <Modal xs={9}   onHide={handleModalClose}  show={updateModal}  >
                <Modal.Body>
              {SuccessUpdateState?.loading ? <MainLoader/>: <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={handleModalClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >

                                              <Row>
                                        <Col className="text-xenter mt-1" lg={4}>
                                            <Form.Label className="mt-1"> Zone:</Form.Label>
                                        </Col>
                                        <Col lg={8}>
                                            <Form.Select value={value?.zone} onChange={handleZoneChange}>
                                                
                                                {zoneList?.map((ele, ind) => {
                                                    return <option key = {ind} value={ele?._id}>{ele?.zone} </option>;
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                              <Row className='mt-2'>
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                  <Form.Label className='' >
                                                       State:
                                                          </Form.Label>
                                                          </Col>
                                                          <Col lg={8}>
                                                          <Form.Control disabled = {true} value={value?.state}
                                                            type="text"
                                                           />
                                                  </Col>
                                                </Row>
                                                  <Row className="mt-2">
                                                      <Col  className="text-xenter mt-1"lg={4}>
                                                          <Form.Label className='' >
                                                       Updated State :
                                                          </Form.Label>
                                                      </Col>
                                                      <Col lg={8}>
                                                          <Form.Group className="" >
                                                          <Form.Control  value={value?.updatedState} onChange={handleUpdatedState}
                                                            type="text"
                                                           />
                                                          </Form.Group>
                                                      </Col>
                                                  </Row>
                                              </Form.Group>
                                          </Col>
                  </Row>
                  <Col className='text-end mt-2'><Button onClick = {handleUpdate}>Update</Button> </Col>
                  </>}
              </Modal.Body>
              </Modal>

    </>
)
}
export default Update