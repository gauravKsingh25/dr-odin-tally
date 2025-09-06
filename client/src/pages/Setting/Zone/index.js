import React from 'react'
import { Button } from 'react-bootstrap'
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Create from './Model/create';
import MainLoader from '../../../components/MainLoader';
import { createZoneAction, deleteZone, getZoneAction, updateZone } from '../../../redux/setting/action';
import Update from './Model/update';

import ToastHandle from '../../../constants/Toaster/Toaster';
function Zone() {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const[updateModal,setUpdateModal] = useState(false)
    const successHandle = store?.getZoneReducer;
    const successDeleteHandle = store?.deleteZoneReducer
    const[getStateData,setStateData] = useState([])
    const [deleteId,setDeleteId] = useState("")
    const [updateData,setUpdateData] = useState()
    const [openZoneModel, setOpenZoneModel] = useState(false)
    const [deleteModal,setDeletemodal] = useState(false)
    const [render, setRender] = useState(false)
    const hanldeZone = () => {
        setOpenZoneModel(true)
    }
    const handleUpdate = (data)=>{
        setUpdateModal(true)
        setUpdateData(data)
    }
    const closeUpdateModal = (data)=>{
        if(data==="render"){
            setRender(!render)
        }
        setUpdateModal(false)
    }
    const closeZoneModal = (data) => {
        if (data == "render") {
            setRender(!render)
        }
        setOpenZoneModel(false)
    }
    const handleDeleteModal = ()=>{
        dispatch(deleteZone(deleteId))   
        setDeletemodal(false)

    }
    const handleDelete = (data)=>{
        setDeleteId(data?._id)
        setDeletemodal(true)
    }
    useEffect(()=>{
dispatch(getZoneAction())
 },[render])
 useEffect(() => {
    if(successDeleteHandle?.data?.status==200){
      setRender(!render)
      ToastHandle("success","Deleted Successfully")
    }
  }, [successDeleteHandle])
  return (
    <> 
 <Card>
 {successHandle?.loading ? (
                        <MainLoader />
                    ) : (
            <Card.Body>
                    <Row>
                        <Col className="text-end" lg={12}>
                            <Button className=' rounded-pill' onClick={hanldeZone}>Create Zone</Button>
                        </Col>
                    </Row>



                    <Table className="table-centered mb-0 mt-2">
                        <thead className="table-dark">
                            <tr>
                                <th>Sr no.</th>
                                <th> Zone </th>
                                <th>Update</th>
                                <th>Delete</th>
                            
                            </tr>
                        </thead>
                        <tbody>
                            {store?.getZoneReducer?.data?.response?.map((ele, index) => {
                                return (
                                    <tr key={index}>
                                        <td scope="row">{index + 1}</td>
                                        <td>{ele?.zone}</td>
                                        <td>
                                            {' '}
                                            <>
                                                {' '}
                                                <i
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleUpdate(ele)}
                                                    className="dripicons-document-edit"></i>
                                            </>
                                        </td>
                                        <td>
                                            <i
                                                style={{ cursor: 'pointer' }}
                                                className=" dripicons-trash"
                                                onClick={() => handleDelete(ele)}
                                                >
                                                    
                                                </i>
                                        </td>
                                       
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
                    )}
            </Card>
            <Create modal={openZoneModel} closeModal={closeZoneModal} />
            <Update modal={updateModal} closeModal={closeUpdateModal} data = {updateData}/>


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
  )
}

export default Zone
