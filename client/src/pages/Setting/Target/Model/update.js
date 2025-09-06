import React,{useState,useEffect} from 'react'
import { Button } from 'react-bootstrap'
import { Card,Row,Col,CloseButton,Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch,useSelector } from 'react-redux';
import { updateProjectionAction, updateState } from '../../../../redux/setting/action';
import MainLoader from '../../../../components/MainLoader';
import ToastHandle from '../../../../constants/Toaster/Toaster';
function Update({modal,closeModal,data}){
    const dispatch= useDispatch()
    const store = useSelector((state)=>state)
    const SuccessUpdateProjection = store?.UpdateProjectionReducer
    const [value,setValue] = useState({trgtAmt:"",amount:""})
    const [updateModal,setUpdateModalModal] = useState(false)


    const handleModalClose = ()=>{
        setUpdateModalModal(false)
        closeModal()
    }
    const handleUpdatedAmmount = (e)=>{
        setValue({...value,amount:e.target.value})

    } 
    const handleUpdate = ()=>{ 
        if (value?.amount.trim()!==''){
            dispatch(updateProjectionAction({amount:value?.amount,id:data?._id}))
        }
      else{
        ToastHandle('error','Amount is required')
      }
    }

    useEffect(()=>{
        setValue({ ...value,trgtAmt:data?.trgtAmt });
        setUpdateModalModal(modal)
    },[modal])
  

    useEffect(() => {
      if(SuccessUpdateProjection?.data?.status==200){
        setValue({...value,amount:""})
        setUpdateModalModal(false)
        closeModal("render")
        ToastHandle("success","Updated Successfully 👍")
      }
      else if(SuccessUpdateProjection?.data?.status==400){
        setUpdateModalModal(false)
        closeModal("")
        ToastHandle("error","Not Updated 😔")
      }
      else{
        setValue({...value,amount:""})
        setUpdateModalModal(false)
        closeModal()
       
      }
    }, [SuccessUpdateProjection])
    

return(
    <>
     <Modal xs={9}   onHide={handleModalClose}  show={updateModal}  >
                <Modal.Body>
              {SuccessUpdateProjection?.loading ? <MainLoader/>: <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={handleModalClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >
                                              <Row>
                                                        <Col className="text-xenter mt-1" lg={4}>
                                                            <Form.Label className="">Amount :</Form.Label>
                                                        </Col>
                                                        <Col lg={8}>
                                                            <Form.Group
                                                                className=""
                                                               >
                                                                <Form.Control disabled = {true}  value={value?.trgtAmt} type="text" />

                                                                {/* </Form.Control> */}
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row className="mt-2">
                                                      <Col  className="text-xenter mt-1"lg={4}>
                                                          <Form.Label className='' >
                                                       Updated Amount :
                                                          </Form.Label>
                                                      </Col>
                                                      <Col lg={8}>
                                                          <Form.Group className="" >
                                                          <Form.Control  value={value?.amount} onChange={handleUpdatedAmmount}
                                                            type="number"
                                                           />
                                                          </Form.Group>
                                                      </Col>
                                                  </Row>
                                              </Form.Group>
                                          </Col>
                  </Row>
                  <Col className='text-end mt-2'><Button onClick = {()=>{handleUpdate()}} >Update</Button> </Col>
                  </>}
              </Modal.Body>
              </Modal>

    </>
)
}
export default Update