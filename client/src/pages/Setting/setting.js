import React from 'react'
import { Button } from 'react-bootstrap'
import { Card,Row,Col,CloseButton,Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react'
import { getDesignationByPost, getZoneAction } from '../../redux/actions';
import { useDispatch,useSelector } from 'react-redux';
import { useEffect } from 'react'
import { StateCreateAction ,getState,createCity,getCity,insertDesignation, updateState, updateDesignation} from '../../redux/setting/action';
import MainLoader from '../../components/MainLoader';
import { Table } from 'react-bootstrap';
import ToastHandle from '../../constants/Toaster/Toaster';
import "../staff managments/staff managment/style.css";
import "../../style.css"

function Setting() {
  const dispatch = useDispatch()
  const store = useSelector((state)=>state)
  const successHandle = store?.StateCreateReducer
  const SuccessUpdateState = store?.UpdateStateReducer
  const citySuccesshanlde = store?.createCityReducer
  const SuccessInsertDesignation = store?.InsertDesignationReducer
  const SuccessUpdateDesignation = store?.UpdateDesignationReducer
  const insertDesignationHandle = store?.InsertDesignationReducer
  const [ showModel,setShowModel] = useState(false)
  const [ yearshowModel,setYearShowModel] = useState(false)
  const [ createdesiModel,setcreatedesiModel] = useState(false)
  const [ updateStateModel,setupdateStateModel] = useState(false)
  const [ updateDesignationModel,setupdateDesignationModel] = useState(false)
  const [loader,setLoader] = useState(false)
  const [cityLoader,setCityLoader] = useState(false)
  const[designaationLoader,setDesignationLoader] = useState(false)
  const [selectedState,setSelectedState] = useState("")
  const [selectedDesignation,setselectedDesignation] = useState("")
  const [updateStateValue,setUpdateStateValue] = useState("")

  const handleCloseee = () => setYearShowModel(false);
  const stateUpdateHandleClose=()=>setupdateStateModel(false);
  const designationUpdateHandleClose=()=>setupdateDesignationModel(false);
  const handleClose = () => setShowModel(false);
  const createhandleClose = () => setcreatedesiModel(false);
  const [mode,setMode] = useState("state")

  const[data,setData] = useState({state:"",zone:"",selectState:"",enterCity:"",city:"",designation:""})

  const createhandelchangee=()=>{
    setcreatedesiModel(true)
  }
  const handleSelectState = (e)=>{
    setData({...data,selectState:e.target.value})
  }
  const handleEnterCity = (e)=>{
setData({...data,enterCity:e.target.value})
  }
  const handleUpdateState =(ele)=>{
    setUpdateStateValue("")
    setSelectedState(ele)
    setupdateStateModel(true)
  }
  const handleUpdateDesignation =(ele)=>{
    setselectedDesignation(ele)
    setupdateDesignationModel(true)
  }

  const handelchangee=()=>{
    setShowModel(true)
  }
  const handelchangeee=(ele)=>{
    setSelectedState(ele)
    setYearShowModel(true)
  }
  
  const handleZoneChangee = (e) =>{
    setData({...data,zone:e.target.value})  
}
const handleStateChange = (e)=>{
  setData({...data,state:e.target.value})
}
const handleAdd =()=>{
  dispatch(StateCreateAction({
    state:data.state,
    zoneId:data.zone
  }))
}

const handleAddCity = ()=>{
  dispatch(createCity({city:data?.enterCity,stateId:selectedState?._id}))
}
const handleCityChange = (e)=>{
setData({...data,city:e.target.value})
}
const handleDesignationChange = (e)=>{
setData({...data,designation:e.target.value})
}
const handleDesignation = ()=>{
  let body = {designation:data?.designation}
  dispatch(insertDesignation(body))
  
}
const handleUpdateStatebutton=()=>{
  dispatch(updateState({state:updateStateValue,stateId:selectedState?._id}))

  setUpdateStateValue("")
}

const handleUpdateDesignationbutton=()=>{
  dispatch(updateDesignation({
    designationId:selectedDesignation?._id,
    designation:updateStateValue
  }))
  setupdateDesignationModel(false)
  setUpdateStateValue("")
}
  useEffect(() => {
    dispatch(getZoneAction())
    dispatch(getState())
     dispatch(getCity({id:"",skip:1}))
     dispatch(getDesignationByPost())
     
  }, [])
  useEffect(() => {
   if(successHandle?.loading){
setLoader(true)
   }
   else if(successHandle.status==200){
    ToastHandle("success","successFully created")
   }
   else{
    handleClose()
    setLoader(false)

   }
  }, [successHandle])

  useEffect(() => {
    if(citySuccesshanlde?.loading){
      setCityLoader(true)
    }
    else if(citySuccesshanlde?.data?.status==200){

      ToastHandle("success","city created")
    }
    else{
      setCityLoader(false)
      setYearShowModel(false)
    
    }
  }, [citySuccesshanlde])

  useEffect(() => {
    if(insertDesignationHandle?.loading){
      setDesignationLoader(true)
      
    }
    else if(insertDesignationHandle?.status==200){
      ToastHandle("success","successFully added designation")
    }
    
    else{
      setDesignationLoader(false)
      setcreatedesiModel(false)
    
    }
  }, [insertDesignationHandle])

  useEffect(() => {
    if(SuccessUpdateState?.data?.status==200){
      setupdateStateModel(false)
      ToastHandle("success"," updated successFully")

    }
    else{
      setupdateStateModel(false)
    }
    
  }, [SuccessUpdateState]);
  useEffect(() => {
    if(SuccessUpdateDesignation?.data?.status==200){
      ToastHandle("success"," updated successFully")
    }
   
    
  }, [SuccessUpdateDesignation]);
  useEffect(() => {
    if(insertDesignationHandle?.data?.status==200){
      ToastHandle("success","  SuccessFully created")
    }
   
    
  }, [insertDesignationHandle]);
  


  return (

    <>
    <Row>
    <Col>
    <Card>
        <Card.Body>
          <Row>
            <Col lg={12}>
              <Row>
                <Col lg={12}>
                 <Button className={`${mode=="state"?"employee":""} employeee btn   mx-0 px-3`}onClick = {()=>{setMode("state")}}   >  State</Button>
                <Button className={`${mode=="designation"?"employee":""}  employeee btn   mx-2 px-3`}onClick = {()=>{setMode("designation")}} >  Designation</Button>
                </Col>
              </Row>
            </Col>
          </Row>

        </Card.Body>
        </Card>
        </Col>
        </Row>
{/* create state model */}
        <Modal xs={9}   onHide={()=>{setShowModel(false)}}  show={showModel} 
          
    >
          <Modal.Body>
         {loader? <MainLoader/>: <>
          <Col className='text-end' lg={12}>
            <CloseButton onClick={handleClose}/>
            </Col>
            <Row>
            <Col className='mt-2' lg={12}>
                                        <Form.Group >
                                          <Row>
                                          <Col  className="text-xenter mt-1"lg={4}>
                                            <Form.Label className='' >
                                                 Zone:
                                                    </Form.Label>
                                                    </Col>
                                                    <Col lg={8}>
                                                    <Form.Select value={data.zone} onChange={handleZoneChangee}>
                                                    <option value=" "> --Select-- </option>
                                          {store?.getZoneListReducer?.getDesignation?.response?.map((ele,ind)=>{
                                            return(<option value={ele?._id}>{ele?.zone} </option>)
                                          })}
                                                    </Form.Select>
                                            </Col>
                                          </Row>
                                            <Row className=" mt-2">
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                    <Form.Label className='' >
                                                  Create state :
                                                    </Form.Label>
                                                </Col>
                                                <Col lg={8}>
                                                    <Form.Group className="" >
                                                    <Form.Control  value = {data?.state} onChange={handleStateChange}
                                                      type="text"
                                                     />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
            </Row>
            <Col className='text-end mt-2'><Button onClick={handleAdd}>Add</Button> </Col>
            </>}
        </Modal.Body>
        </Modal>
        {/*Create city Model*/}
        <Modal xs={9}   onHide={()=>{setYearShowModel(false)}}  show={yearshowModel} 
          
    >
          <Modal.Body>
         {cityLoader?<MainLoader/>: <>
          <Col className='text-end' lg={12}>
            <CloseButton onClick={handleCloseee}/>
            </Col>
            <Row>
            <Col className='mt-2' lg={12}>
                                        <Form.Group >
                                        <Row>
                                          <Col  className="text-xenter mt-1"lg={4}>
                                            <Form.Label className='' >
                                                 State:
                                                    </Form.Label>
                                                    </Col>
                                                    <Col lg={8}>
                                                    <Form.Control disabled={true}  value={selectedState?.state} onChange = {handleSelectState}
                                                      type="text"
                                                     />
                                            </Col>
                                          </Row>
                                            <Row className="mt-2">
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                    <Form.Label className='' >
                                                 Enter City
                                                    </Form.Label>
                                                </Col>
                                                <Col lg={8}>
                                                    <Form.Group className="" >
                                                    <Form.Control  value={data?.enterCity} onChange = {handleEnterCity}
                                                      type="text"
                                                     />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
            </Row>
            <Col className='text-end mt-2'><Button onClick={handleAddCity}>Add City</Button> </Col>
            </>}
        </Modal.Body>
        </Modal>
 {/* Updated state model */}
 <Modal xs={9}   onHide={()=>{setupdateStateModel(false)}}  show={updateStateModel}  >
                <Modal.Body>
               <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={stateUpdateHandleClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >
                                              <Row>
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                  <Form.Label className='' >
                                                       State:
                                                          </Form.Label>
                                                          </Col>
                                                          <Col lg={8}>
                                                          <Form.Control disabled={true}  value={selectedState?.state} onChange = {handleSelectState}
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
                                                          <Form.Control value={updateStateValue} onChange = {(e)=>{setUpdateStateValue(e.target.value)}}  
                                                            type="text"
                                                           />
                                                          </Form.Group>
                                                      </Col>
                                                  </Row>
                                              </Form.Group>
                                          </Col>
                  </Row>
                  <Col className='text-end mt-2'><Button onClick={handleUpdateStatebutton}>Update</Button> </Col>
                  </>
              </Modal.Body>
              </Modal>

 
         {/* Create Designation */}
         <Modal xs={9}   onHide={()=>{setcreatedesiModel(false)}}  show={createdesiModel} 
          
          >
                <Modal.Body>
                {designaationLoader? <MainLoader/>:  <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={createhandleClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >
                                              <Row>
                                          <Col  className="text-xenter mt-1"lg={4}>
                                            <Form.Label className='' >
                                              City
                                                    </Form.Label>
                                                    </Col>
                                                    <Col lg={8}>
                                                    <Form.Select value={data.city} onChange={handleCityChange}>
                                                    <option value=" "> --Select City-- </option>
                                          {store?.getCityReducer?.data?.response?.map((ele,ind)=>{
                                            return(<option value={ele?._id}>{ele?.city} </option>)
                                          })}
                                                    </Form.Select>
                                            </Col>
                                          </Row>
                                                  <Row className="mt-2">
                                                      <Col  className="text-xenter mt-1"lg={4}>
                                                          <Form.Label className='' >
                                                       Enter Designation :
                                                          </Form.Label>
                                                      </Col>
                                                      <Col lg={8}>
                                                          <Form.Group className="" >
                                                          <Form.Control  onChange= {handleDesignationChange}
                                                            type="text"
                                                           />
                                                          </Form.Group>
                                                      </Col>
                                                  </Row>
                                              </Form.Group>
                                          </Col>
                  </Row>
                  <Col className='text-end mt-2'><Button  onClick={()=>{handleDesignation()}}>Create</Button> </Col>
                  </>}
              </Modal.Body>
              </Modal>

              {/* Updated designation  model */}
 <Modal xs={9}   onHide={()=>{setupdateDesignationModel(false)}}  show={updateDesignationModel}  >
                <Modal.Body>
               <>
                <Col className='text-end' lg={12}>
                  <CloseButton onClick={designationUpdateHandleClose}/>
                  </Col>
                  <Row>
                  <Col className='mt-2' lg={12}>
                                              <Form.Group >
                                              <Row>
                                                <Col  className="text-xenter mt-1"lg={4}>
                                                  <Form.Label className='' >
                                                      Designation
                                                          </Form.Label>
                                                          </Col>
                                                          <Col lg={8}>
                                                          <Form.Control disabled={true}  value={selectedDesignation?.designation} onChange = {handleSelectState}
                                                            type="text"
                                                           />
                                                  </Col>
                                                </Row>
                                                  <Row className="mt-2">
                                                      <Col  className="text-xenter mt-1"lg={4}>
                                                          <Form.Label className='' >
                                                       Update :
                                                          </Form.Label>
                                                      </Col>
                                                      <Col lg={8}>
                                                          <Form.Group className="" >
                                                          <Form.Control value={updateStateValue} onChange = {(e)=>{setUpdateStateValue(e.target.value)}}  
                                                            type="text"
                                                           />
                                                          </Form.Group>
                                                      </Col>
                                                  </Row>
                                              </Form.Group>
                                          </Col>
                  </Row>
                  <Col className='text-end mt-2'><Button onClick={handleUpdateDesignationbutton}>Update</Button> </Col>
                  </>
              </Modal.Body>
              </Modal>

              {/* State table  */}
              {mode==="state"?  <Card>
            <Card.Body>
            <Row>
                    <Col  className="text-end"lg={12}>
                    <Button className=' rounded-pill ' onClick={()=>{handelchangee()}} modelShow  = {showModel} > Create State</Button> 
                    </Col>
                  </Row>

                <Table className="table-centered mb-0 mt-2">
                    <thead className="table-dark">
                        <tr>
                        <th>Sr no.</th>
                            <th>Name</th>
                            <th>  Create City</th>
                            <th>  Update State</th>
                            {/* <th>
                            <Button className=' rounded-pill ' onClick={()=>{handelchangee()}} modelShow  = {showModel} > Create State</Button>
                            </th> */}
                            
                        </tr>
                    </thead>
                    <tbody>
                        {store?.getStateReducer?.data?.response?.map((record, index) => {
                            return (
                                <tr key={index}>
                                    <th scope="row">{index+1}</th>
                                    <td>{record.state}</td>

                                    <td> <Button className=' rounded-pill' onClick={()=>handelchangeee(record)} modelShow  = {yearshowModel}> Create City</Button></td>
                                    <td> <Button className=' rounded-pill' onClick={()=>handleUpdateState(record)} modelShow  = {updateStateModel}> Update</Button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
        :
        // Designation table
        <Card>
            <Card.Body>
            <Row>
                    <Col  className="text-end"lg={12}>
                    <Button className=' rounded-pill ' onClick={createhandelchangee} modelShow  = {yearshowModel}>  Designation</Button>
                    </Col>
                  </Row>

                <Table className="table-centered mb-0 mt-2">
                    <thead className="table-dark">
                        <tr>
                        <th>Sr no.</th>
                            <th>Name</th>
                            <th>Update</th>
                            
                            {/* <th>
                            <Button className=' rounded-pill ' onClick={()=>{handelchangee()}} modelShow  = {showModel} > Create State</Button>
                            </th> */}
                            
                        </tr>
                    </thead>
                    <tbody>
                        {store?.GetDesignationReducer?.getDesignation?.response?.map((record, index) => {
                            return (
                                <tr key={index}>
                                    <th scope="row">{index+1}</th>
                                    <td>{record?.designation}</td>
                                    <td> <Button className=' rounded-pill' onClick={()=>handleUpdateDesignation(record)} modelShow  = {updateStateModel}> Update</Button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>}
    </>
  )
}

export default Setting