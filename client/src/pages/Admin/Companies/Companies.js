import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import Create from './Model/Create';
import Modal from 'react-bootstrap/Modal';
import Edit from './Model/Edit';
import MainLoader from '../../../components/MainLoader';
import { useDispatch, useSelector } from 'react-redux';
import { companyListAction } from '../../../redux/Admin/action';
import { companyStatusAction } from '../../../redux/Admin/action';
import "../style.css"
import config from '../../../config';
function Companies() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state)
  const [openModel, setOpenModel] = useState(false)
  const [updateModal, setUpdateModal] = useState(false)
  const [updateData, setUpdateData] = useState()
  const [deleteModal, setDeletemodal] = useState(false)
  const [render, setRender] = useState(false)
  const [show, setShow] = useState(false);
  const [statusId, setStatusId] = useState();
  const [statusChecked, setStatusChecked] = useState(false);
  const [active, setActive] = useState(1)

  const CompanyListLoader = store?.getCompanyListReducer;
  const handleClose = () => setShow(false);
  const handleUpdate = (data) => {
    setUpdateModal(true)
    setUpdateData(data)
  }
  const handleModalYes = () => {
    if (statusChecked) {
      let daata = {
        cid: statusId,
        status: true
      }
      dispatch(
        companyStatusAction((daata))
      );
    }
    else {
      let daata = {
        cid: statusId,
        status: false
      }
      dispatch(
        companyStatusAction((daata))
      );
    }
    setShow(false)
  }
  const closeUpdateModal = (val) => {
    if (val == "render") {

      setRender(!render)
    }
    setUpdateModal(false)
  }
  const handleDelete = () => {

    setDeletemodal(true)
  }
  const closeModal = (val) => {
    if (val == "render") {
      setRender(!render)
    }

    setOpenModel(false)
  }
  const handleCreateCompanyModel = () => {
    setOpenModel(true)
  }
  useEffect(() => {
    dispatch(companyListAction(active))
  }, [render])
  const handelstatus = (e, record) => {
    setShow(true);
    setStatusId(record?._id)
    setStatusChecked(e.target.checked)
    // if (e.target.checked) {

    //   let daata = {
    //     cid: record?._id,
    //     status: true
    //   }
    //   dispatch(
    //     companyStatusAction((daata))
    //   );
    // }
    // else {

    //   let daata = {
    //     cid: record?._id,
    //     status: false
    //   }
    //   dispatch(
    //     companyStatusAction((daata))
    //   );
    // }
  };
  const handleActive = (val) => {
    if (val == "active") {
      setActive(1)
      dispatch(companyListAction(1))

    }
    else {
      setActive(0)
      dispatch(companyListAction(0))

    }
  }
  return (

    <>
      <Card>
        {CompanyListLoader?.loading ? (
          <MainLoader />
        ) : (
          <Card.Body className='py-0'>
            <Row>
            
              <Col className='d-flex justify-content-between mt-1' lg={12}>
                <div classname="d-flex">
                  
                  <Button className={`${active == 1 ? 'employee' : ''
                    } employee-btn mx-0 px-3 fw-bold btn-secondary`} onClick={() => handleActive("active")}>Active</Button>
                  <Button className={`${active == 0 ? 'employee' : ''
                    } left-employee-btn mx-2 px-2 fw-bold btn-secondary`} onClick={() => handleActive("inActive")}>In-Active</Button>
                </div>
                {active == 1 &&
                  // <Button className=" rounded-pill" onClick={handleCreateCompanyModel}> Create</Button>
                  <Button
                    className="btn create-btn ms-3 pt-0 pb-0 ps-1 pe-1  btn-secondary"
                    onClick={handleCreateCompanyModel}>
                    <i className="uil-plus " style={{fontSize:"20px"}}></i>
                  </Button>

                }
              </Col>
            </Row>
            <Row className='overflow-auto'>
              <Table width="900px" className="table-centered mt-1 table_hoveWork" size='sm '>
                <thead className="table-dark">
                  <tr>
                    <th width="100px"> #</th>
                    <th width="100px"> Company Name</th>
                    <th width="100px"> User Name</th>
                    <th width="100px"> Email</th>
                    <th width="100px">Logo</th>
                    <th width="100px">GST No</th>
                    <th width="100px">Taxation Id </th>
                    {active == 1 && <th width="100px">Edit</th>}
                    <th width="100px">Status</th>

                  </tr>
                </thead>

                <tbody>
                  {CompanyListLoader?.data?.response?.map((record, index) => {
                    return (
                      <tr key={index}>
                        <th scope="row" className="text-truncater ">
                          <p className='my-0'>{index + 1}</p>   </th>
                        <td width="100px" className="text-truncater " ><p className="text-nowrap txt_showDots admin_width my-0">{record?.company}</p></td>
                        <td width="100px" className="text-truncater " ><p className="text-nowrap txt_showDots admin_width my-0">{record?.username}</p></td>
                        <td width="100px" className="text-truncater "><p className="text-nowrap txt_showDots admin_width my-0">{record?.email}</p></td>
                        <td width="100px" className="text-truncater ">
                          <div className="text-nowrap txt_showDots admin_width my-0 ">
                            <img className="w-25" src={record?.logo} />
                          </div>

                        </td>
                        <td width="100px" className="text-truncater "><p className="text-nowrap txt_showDots admin_width my-0 ">{record?.gstNo}</p></td>
                        <td width="100px" className="text-truncater "> <p className="text-nowrap txt_showDots admin_width my-0">{record?.taxationId}</p></td>
                        {active == 1 && <td width="100px" className="text-truncater ">
                          <i className='uil-edit-alt' style={{ cursor: 'pointer' }} onClick={() => handleUpdate(record)}></i>
                        </td>}
                        <td width="100px" className="text-truncater ">
                          <Form.Check
                            type="switch"
                            id="custom-switch"
                            checked={record?.status}
                            onChange={(e) => handelstatus(e, record)}
                          />
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </Table></Row>
          </Card.Body>)}
        <Create modal={openModel} close={closeModal} />
        <Edit modal={updateModal} closeModal={closeUpdateModal} data={updateData} />
      </Card>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <Row>

            <Col className="ms-3 mt-2" lg={12}>
              Are you sure you want to {active == 0 ? "activate" : "deactivate"} this company ?
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <Row>
                <Col className="text-end mt-3" lg={10}>
                  <Button variant="secondary" onClick={handleModalYes}>
                    Yes
                  </Button>
                </Col>
                <Col className="text-end mt-3" lg={2}>
                  <Button variant="primary" onClick={handleClose}>
                    NO
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default Companies