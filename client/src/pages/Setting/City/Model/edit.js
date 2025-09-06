import React,{useState,useEffect} from 'react'
import { Button } from 'react-bootstrap'
import { Card,Row,Col,CloseButton,Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch,useSelector } from 'react-redux'; 
import { updateCity } from '../../../../redux/setting/action';
import ToastHandle from '../../../../constants/Toaster/Toaster';
import MainLoader from '../../../../components/MainLoader';

function Update({modal,close,data}){
    const dispatch= useDispatch()
    const store = useSelector((state)=>state)
    const SuccessHandle = store?.UpdateCityReducer
    const [value,setValue] = useState({city:"",updatedCity:"",stateIsdd: "",stateiddd:""})
   const[updateModal,setUpdateModalModal] = useState(false)
   const [stateList, setstateList] = useState([]);


    const handleModalClose = ()=>{
        setUpdateModalModal(false)
        close()
    }
    const handleUpdate = ()=>{
        if(value?.updatedCity.trim()!==""){
            dispatch(updateCity({city:value?.updatedCity,id:data?._id,stateId:value?.stateIsdd,id:data?._id}))
        }
        else{
            ToastHandle("error","City can't be empty")
        }

    }
    useEffect(() => {
        setstateList(store?.getStateReducer?.data?.response)
    }, [store])

    useEffect(() => {
        setValue({...value,city:data?.city,stateIsdd:data?.stateId?._id})
        setUpdateModalModal(modal)
    }, [modal])
    
  useEffect(() => {
   if(SuccessHandle?.data?.status==200){
       setUpdateModalModal(false)
       close("render")
       setValue({city:"",updatedCity:"",stateIsdd:""})
       ToastHandle("success","Sucessfully updated 👍")
   }
   else if(SuccessHandle?.data?.status==400){
    ToastHandle("error","Something went wrong 😔")
    setUpdateModalModal(false)
    close()
   }
   else{
    setUpdateModalModal(false)
    close()
   }
  }, [SuccessHandle]);

    
return(
    <>
     <Modal xs={9}   onHide={handleModalClose}  show={updateModal}  >
                <Modal.Body>
           { SuccessHandle?.loading?<MainLoader/>: <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={handleModalClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >

                                              <Row>
                                        <Col className="text-xenter mt-1" lg={4}>
                                            <Form.Label className="">  State:</Form.Label>
                                        </Col>
                                        <Col lg={8}>
                                            <Form.Select value={value?.stateIsdd} onChange = {(e)=>{setValue({...value,stateIsdd:e.target.value})}} >
                                               
                                                {stateList?.map((ele, ind) => {
                                                    return <option key = {ind} value={ele?._id}>{ele?.state} </option>;
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                              <Row className='mt-2'>
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                  <Form.Label className='' >
                                                       City:
                                                          </Form.Label>
                                                          </Col>
                                                          <Col lg={8}>
                                                          <Form.Control disabled = {true} value={value?.city}
                                                            type="text"
                                                           />
                                                  </Col>
                                                </Row>
                                                  <Row className="mt-2">
                                                      <Col  className="text-xenter mt-1"lg={4}>
                                                          <Form.Label className='' >
                                                       Updated City :
                                                          </Form.Label>
                                                      </Col>
                                                      <Col lg={8}>
                                                          <Form.Group className="" >
                                                          <Form.Control  value={value?.updatedCity}  onChange={(e)=>{setValue({...value,updatedCity:e.target.value.replace(/[^a-z. ]/gi, '')})}}
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