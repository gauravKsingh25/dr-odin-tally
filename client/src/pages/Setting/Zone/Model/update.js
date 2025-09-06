import React,{useState,useEffect} from 'react'
import { Button } from 'react-bootstrap'
import { Card,Row,Col,CloseButton,Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch,useSelector } from 'react-redux';
import MainLoader from '../../../../components/MainLoader';
import ToastHandle from '../../../../constants/Toaster/Toaster';
import { updateZone } from '../../../../redux/setting/action';
function Update({modal,closeModal,data}){
    const dispatch= useDispatch()
    const store = useSelector((state)=>state)
    const SuccessUpdateZone = store?.UpdateZoneReducer
    const [value,setValue] = useState({zone:"",updatedZone:""})
    const [updateModal,setUpdateModalModal] = useState(false)


    const handleModalClose = ()=>{
        setUpdateModalModal(false)
        closeModal()
    }
    const handleUpdatedZone = (e)=>{
        setValue({...value,updatedZone:e.target.value.replace(/[^a-z. ]/gi, '')})
    } 
    const handleUpdate = ()=>{
      if(value?.updatedZone.trim()!==''){
        dispatch(updateZone({
          id:data?._id,
          zone:value?.updatedZone
        }))}
        else
        {
ToastHandle("error","zone can't be empty")
        }
        
    }

    useEffect(()=>{
        setValue({...value,zone:data?.zone})
        setUpdateModalModal(modal)
    },[modal])

    useEffect(() => {
      if(SuccessUpdateZone?.data?.status==200){
        setValue({...value,updatedZone:""})
        setUpdateModalModal(false)
        closeModal("render")
        ToastHandle("success","Updated Successfully 👍")
      }
      else if(SuccessUpdateZone?.data?.status==400){
        setUpdateModalModal(false)
        closeModal("")
        ToastHandle("error","Not Updated 😔")
      }
      else{
        setValue({...value,updatedZone:""})
        setUpdateModalModal(false)
        closeModal()
       
      }
    }, [SuccessUpdateZone])
    

return(
    <>
     <Modal xs={9}   onHide={handleModalClose}  show={updateModal}  >
                <Modal.Body>
              {SuccessUpdateZone?.loading ? <MainLoader/>: <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={handleModalClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >
                                              <Row>
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                  <Form.Label className='' >
                                                       Zone
                                                          </Form.Label>
                                                          </Col>
                                                          <Col lg={8}>
                                                          <Form.Control disabled = {true} value={value?.zone}
                                                            type="text"
                                                           />
                                                  </Col>
                                                </Row>
                                                  <Row className="mt-2">
                                                      <Col  className="text-xenter mt-1"lg={4}>
                                                          <Form.Label className='' >
                                                       Updated Zone:
                                                          </Form.Label>
                                                      </Col>
                                                      <Col lg={8}>
                                                          <Form.Group className="" >
                                                          <Form.Control  value={value?.updatedZone} onChange={handleUpdatedZone}
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