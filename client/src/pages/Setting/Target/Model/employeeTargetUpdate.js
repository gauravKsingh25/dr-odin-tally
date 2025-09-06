
import React, { useState, useEffect } from 'react';
import { FormGroup } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, CloseButton,Button, Form } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import { addMonthTarget } from '../../../../redux/setting/action';
import ToastHandle from "../../../../constants/Toaster/Toaster"
function EmployeeTargetUpdate({ modal, closeModal, data }) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const SuccessHandle = store?.addMonthTaregtReducer
  const [value, setValue] = useState({ empName: "", designation: "", monthlytarget: "", yearlytarget: "",state:"",city:"" })
  const [updateModal, setUpdateModalModal] = useState(false)
  const [monthTargetInput, setMonthTargetInput] = useState([])
  const[render,setRender] = useState(false)
  const[monthData, setMonthData] = useState([])
  useEffect(() => {
    setValue({ ...value, empName: data?.empName, monthlytarget: data?.mnthtarget, designation: data?.designation?.designation, yearlytarget: data?.yrlytarget,state: data?.state?.state , city: data?.city?.city});
    setUpdateModalModal(modal)
  }, [modal])
  const handleModalClose = () => {
    setUpdateModalModal(false)
    closeModal()
  }
  const handelSelectedMonthTarget = (list,item)=>{
    setRender(!render)
    setMonthTargetInput(list)
}
  const handelRemoveMonthTarget = (list,item)=>{
    setRender(!render)
    setMonthTargetInput(list)
}
const handleChange = (e,x)=>{
  setMonthData(monthData?.map((ele,ind)=>x?._id===ele?._id?{...ele,value:e.target.value}:{...ele}))
}
const handleUpdate = ()=>{
  let month = monthData?.map((ele,ind)=>{
    if(ele?.value){
      return {
        monthid:ele?._id,
        mtarget:ele?.value
      }
    }
  }).filter((ele,ind)=>ele)
  let body={employeId:data?._id,months:month
  }
  dispatch(addMonthTarget(body))
}
useEffect(() => {
  setMonthData(store?.getFullMonthReucer?.data?.response)
}, [render,store])
useEffect(() => {
 if(SuccessHandle?.data?.status===200){
  ToastHandle("success","Successfully Updated")
  setUpdateModalModal(false)
  closeModal("render")
  setMonthTargetInput([])
 }
}, [SuccessHandle])

  return (
    <>
    
      <Modal xs={9} size={"xl "} onHide={handleModalClose} show={updateModal}  >
        <Modal.Body  className='px-4'>
          <Col className='text-end' lg={12}>
            <CloseButton onClick={handleModalClose} />
          </Col>
          <Row className=' mt-1'>
            <Col className='mt-2' lg={12}>
              <Row>
                <Col lg={6}>
                  <FormGroup>
                    <Row>
                      <Col className="mt-1 " lg={4}>
                        <Form.Label className="">Name :</Form.Label>
                      </Col>
                      <Col lg={8}>
                        <Form.Group
                          className=""
                        >
                          <Form.Control disabled={true} value={value?.empName} type="text" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
                <Col lg={6}>
                  <Form.Group >
                    <Row className="d-flex align-items-center">
                      <Col lg={4}>
                        <Form.Label className='mt-1'>
                          Designation :
                        </Form.Label>
                      </Col>
                      <Col lg={8}>

                        <Form.Group
                          className=""
                        >
                          <Form.Control disabled={true} value={value?.designation} type="text" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
              </Row>

            </Col>
          </Row>

          <Row className='mt-2 '>
            <Col  className=''lg={12}>
              <Row>

                <Col lg={6}>
                  <FormGroup>
                    <Row>
                      <Col className="mt-1 " lg={4}>
                        <Form.Label className="">State :</Form.Label>
                      </Col>
                      <Col lg={8}>
                        <Form.Group
                          className=""
                        >
                          <Form.Control disabled={true} value={value?.state} type="text" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
                <Col lg={6}>
                  <FormGroup>
                    <Row>
                      <Col className=" mt-1" lg={4}>
                        <Form.Label className="">City :</Form.Label>
                      </Col>
                      <Col lg={8}>
                        <Form.Group
                          className=""
                        >
                          <Form.Control disabled={true} value={value?.city} type="text" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className='mt-2 '>
            <Col  className='mb-2'lg={12}>
              <Row>

                <Col lg={6}>
                  <FormGroup>
                    <Row>
                      <Col className="mt-1 " lg={4}>
                        <Form.Label className="">Monthly Target :</Form.Label>
                      </Col>
                      <Col lg={8}>
                        <Form.Group
                          className=""
                        >
                          <Form.Control disabled={true} value={value?.monthlytarget} type="text" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
                <Col lg={6}>
                  <FormGroup>
                    <Row>
                      <Col className=" mt-1" lg={4}>
                        <Form.Label className="">Yearly Target :</Form.Label>
                      </Col>
                      <Col lg={8}>
                        <Form.Group
                          className=""
                        >
                          <Form.Control disabled={true} value={value?.yearlytarget} type="text" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <hr/>
          <Row className=''>
            <Col lg={12}>
              <Row>
                <Col lg={6}>

                  <Form.Group>
                    <Row className="d-flex align-items-center mt-2 ">
                      <Col lg={4}>
                        <Form.Label className="mt-1">
                      Updated Target:
                        </Form.Label>
                      </Col>
                      <Col lg={8}>
                        <Multiselect hideSelectedList={true}
                          options={monthData}
                          showCheckbox={true}
                          onRemove={(selectedList: any, selectedItem: any) => { handelRemoveMonthTarget(selectedList, selectedItem) }}
                          displayValue="month"
                          onSelect={(selectedList: any, selectedItem: any) => { handelSelectedMonthTarget(selectedList, selectedItem) }}
                        />
                      </Col>
                    </Row>
                  </Form.Group>
                  </Col>
                  {monthTargetInput?.map((ele, ind) => {
                    return (

                      <Col lg={6}>
                        <Form.Group>
                          <Row className="d-flex align-items-center mt-2 ">
                            <Col className='mt-1' lg={4}>
                              <Form.Label >
                                {ele?.month}
                                 :
                              </Form.Label>
                            </Col>
                            <Col lg={8}>
                              <Form.Group >
                                <Form.Control onChange={(e)=>handleChange(e,ele)}

                                  type="number"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Form.Group>
                      </Col>
                    )
                  })}
                  
                 <Row>
                                                    <Col lg={12} className="text-center mt-3 ">
                                                        {/* <Button type="submit" className="submit-btn" onClick = {handleCreate}>Create</Button> */}

                                                        <Button
                                                            type="submit"
                                                            
                                                            onClick={handleUpdate}
                                                            >
                                                           Update
                                                        </Button>
                                                       
                                                    </Col>
                                                </Row>
              </Row>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      
    </>
  )
}

export default EmployeeTargetUpdate