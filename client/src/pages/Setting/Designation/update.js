import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import MainLoader from '../../../components/MainLoader';
import ToastHandle from '../../../constants/Toaster/Toaster';
import { updateDesignation } from '../../../redux/setting/action';
function Update({ modal, closeModal, data }) {
  const dispatch = useDispatch()
  const store = useSelector((state) => state)
  const SuccessUpdateDesignation = store?.UpdateDesignationReducer
  const [value, setValue] = useState({ designation: "", updatedDesignation: "" ,rm:"" })
  const [updateModal, setUpdateModalModal] = useState(false)


  const handleModalClose = () => {
    setUpdateModalModal(false)
    closeModal()
  }
  const handleUpdatedDesignation = (e) => {
    setValue({ ...value, updatedDesignation: e.target.value.replace(/[^a-z. ]/gi, '') })
  }
  const handleDesignationChange=(e)=>{
    setValue({...value, rm:e.target.value})
  }
  const handleUpdate = () => {
    if (value?.updatedDesignation !== '') {
      dispatch(updateDesignation({
        designationId: data?._id,
        designation: value?.updatedDesignation,
        rmdsgn: value?.rm
      }))
    }
    else {
      ToastHandle("error", "Designation can't be empty")
    }


  }


  useEffect(() => {
    setValue({ ...value, designation: data?.designation , rm: data?.rmdsgn?._id
    })
    setUpdateModalModal(modal)
  }, [modal])

  useEffect(() => {
    if (SuccessUpdateDesignation?.data?.status == 200) {
      setValue({ ...value, updatedDesignation: "" })
      setUpdateModalModal(false)
      closeModal("render")
      ToastHandle("success", "Updated Successfully 👍")
    }
    else if (SuccessUpdateDesignation?.data?.status == 400) {
      setUpdateModalModal(false)
      closeModal("")
      ToastHandle("error", "Not Updated 😔")
    }
    else {
      setValue({ ...value, updatedDesignation: "" })
      setUpdateModalModal(false)
      closeModal()

    }
  }, [SuccessUpdateDesignation])

  return (
    <>
      <Modal xs={9} onHide={handleModalClose} show={updateModal}  >
        <Modal.Body>
          {SuccessUpdateDesignation?.loading ? <MainLoader /> : <>
            <Col className='text-end' lg={12}>
              <CloseButton onClick={handleModalClose} />
            </Col>
            <Row>
              <Col className='mt-2' lg={12}>
                <Form.Group >
                  <Row>
                    <Col className="text-xenter mt-1" lg={4}>
                      <Form.Label className='' >
                        Designation:
                      </Form.Label>
                    </Col>
                    <Col lg={8}>
                      <Form.Control disabled={true} value={value?.designation}
                        type="text"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col className="text-xenter mt-1" lg={4}>
                      <Form.Label className=""> Reporting Manager Designation :</Form.Label>
                    </Col>
                    <Col lg={8}>
                      <Form.Select className='mt-2' value={value?.rm} onChange={handleDesignationChange}
                      >
                        <option value=""> --Select-- </option>
                        {store?.GetDesignationReducer?.getDesignation?.response?.map((ele, ind) => {
                          return (

                            <option key={ele?._id} value={ele?._id}  >{ele?.designation} </option>

                          )
                        })}



                      </Form.Select>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col className="text-xenter mt-1" lg={4}>
                      <Form.Label className='' >
                        New designation:
                      </Form.Label>
                    </Col>
                    <Col lg={8}>
                      <Form.Group className="" >
                        <Form.Control value={value?.updatedDesignation} onChange={handleUpdatedDesignation}
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                </Form.Group>
              </Col>
            </Row>
            <Col className='text-end mt-2'><Button onClick={handleUpdate}>Update</Button> </Col>
          </>}
        </Modal.Body>
      </Modal>

    </>
  )
}
export default Update