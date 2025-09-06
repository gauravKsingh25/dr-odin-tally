import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { getCity } from '../../../redux/setting/action';
import MainLoader from '../../../components/MainLoader';
import Create from './Model/create';
import { getState } from '../../../redux/setting/action';
import { deleteCity } from '../../../redux/setting/action';
import Update from './Model/edit';
import ToastHandle from '../../../constants/Toaster/Toaster';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
function City() {
    const dispatch = useDispatch();
    const[getStateData,setStateData] = useState([])
    const[data,setData] = useState({state:""})
    const store = useSelector((state) => state);
    const getCitySuccess = store?.getCityReducer
    const successDeletHandle = store?.deleteCityReducer
    const[openModel,setOpenModel] = useState(false)
    const [render,setRender] = useState(true)
    const [editData,setEditData] = useState()
    const [editModal,setEditModal] = useState(false)
    const [deleteModal,setDeletemodal] = useState(false)
    const [deleteId,setDeleteId] = useState("")
    const [skip, setSkip] = useState(1);
    const handleStateChange = (e) =>{
        setData({...data,state:e.target.value})  
        dispatch(getCity({id:e.target.value}))
    }

    const handleOpenCityModel = ()=>{
        setOpenModel(true)
    }
    const handleEditButton = (data)=>{
        setEditData(data)
        setEditModal(true)
    }
    const handleDelete = (data)=>{
        setDeleteId(data?._id)
        setDeletemodal(true)
    }
    const handleDeleteModal = ()=>{
        dispatch(deleteCity(deleteId))
        setDeletemodal(false)
    }


    const closeModal  = (data)=>{
        if(data=="render"){
            setRender(!render)
        }
        setOpenModel(false)
    }
    const closeEditModal = (data)=>{
        if(data=="render"){
            setRender(!render)
        }
        setEditModal(false)
    }
    
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number)=>{
        setSkip(value)
        dispatch(getCity({ id:data?.state, skip:value }))
        // Navigate(`/product-wise-report/${value}`,{ state: { skip:value } });   
    }

    useEffect(() => {
   dispatch(getCity({id:data?.state,skip:1}))
   dispatch(getState())
    }, [render])

    useEffect(() => {
      if(successDeletHandle?.data?.status==200){
        setRender(!render)
        ToastHandle("success","Successfully Deleted")
      }
    }, [successDeletHandle])
    useEffect(() => {
        setStateData(store?.getStateReducer?.data?.response)

      }, [store])
    

    return (
        <>
            
              {getCitySuccess?.loading?<MainLoader/>:  <Card.Body>
                    <Row>
                        <Col lg={12}>
                            <Row>
                                <Col lg={6}>
                                <form className="d-flex text ">

                            <div className=" d-flex">
                                        
                                        <div className=" position-relative  ">
                                          
                                            <Form.Group>
                                            <Form.Select style={{backgroundColor:'#f1f3fa' ,color:"black"}}
                                            onChange={handleStateChange}
                                            value={data?.state} 
                                            >
                                            <option value="" > All States</option>
                                            {getStateData?.map((ele,ind)=>{
                                                                return(
                                                               
                                                                    <option value={ele?._id}>{ele?.state} </option>
                                                           
                                                                )
                                                            })} 
                                            </Form.Select>
                                            </Form.Group>
                                           
                                     
                                        </div>
                                        {/* <div className='ms-3'>
                                            <Button ><i className="dripicons-search"></i></Button>
                                        </div> */}
                                
                                </div>
                           
                           </form>
                           
                                </Col>
                                <Col className='text-end' lg={6}>
                               
                            <Button className=" rounded-pill" onClick={handleOpenCityModel} >
                                Create City
                            </Button>
                           
                                    </Col>
                            </Row>
                        </Col>
                        
                    </Row>

                    <Table className="table-centered mb-0 mt-2">
                        <thead className="table-dark">
                            <tr>
                                <th>Sr no.</th>
                                <th>State </th>
                                <th>City </th>
                                {/* <th> Create City</th> */}
                                <th> Update City</th>
                                <th> Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {store?.getCityReducer?.data?.response?.map((ele, index) => {
                                return (
                                    <tr key={index}>
                                        <td scope="row">{(skip - 1) * 20 + index + 1}</td>
                                        <td>{ele?.stateId?.state}</td>
                                        <td>{ele?.city}</td>

                                        
                                        <td>
                                            {' '}
                                            <>
                                                {' '}
                                                <i style={{cursor:"pointer"}} className="dripicons-document-edit" onClick={()=>handleEditButton(ele)}></i>
                                            </>
                                        </td>
                                        
                                        <td>
                                                <i style={{cursor:"pointer"}} className=" dripicons-trash" onClick = {()=>handleDelete(ele)}></i>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>}
                {store?.getCityReducer?.data?.paginationCount>0 &&<Col  lg={12} className="d-flex justify-content-end">
                        <Stack spacing={2}>
                            <Pagination
                                count={store?.getCityReducer?.data?.paginationCount}
                                variant="outlined"
                                shape="rounded"
                                color="primary"
                                onChange={handlePaginationChange}
                            />
                        </Stack>
                    </Col>}

          <Create modal={openModel} close = {closeModal}/>
          <Update modal={editModal} data={editData} close = {closeEditModal}/>



          {/* delete modal starts */}

          <Modal  show={deleteModal} onHide = {()=>{setDeletemodal(false)}} >
        <Modal.Header >
          <Modal.Title>Are you sure! You want to delete </Modal.Title>
        </Modal.Header>
      
        <Modal.Footer>
          <Button variant="secondary" onClick = {()=>{setDeletemodal(false)}} >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteModal} >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

        </>
    );
}
export default City;
