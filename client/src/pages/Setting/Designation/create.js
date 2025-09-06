import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Row, Col, CloseButton, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { insertDesignation } from '../../../redux/setting/action';
import ToastHandle from '../../../constants/Toaster/Toaster';
import MainLoader from '../../../components/MainLoader';

function Create({ modal, closeModal }) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const successDesignation = store?.InsertDesignationReducer;
  const [designationModal, setDesignationModal] = useState(false);
  const [value, setValue] = useState({ designation: "", rm: "", check: false });
  const [designationError, setDesignationError] = useState("");
  const [rmError, setRmError] = useState("");

  const handleClose = () => {
    setDesignationModal(false);
    closeModal();
  };

  const handleChange = (e) => {
    setValue({ ...value, designation: e.target.value.replace(/[^a-z. ]/gi, '') });
    if (!e.target.value?.trim()) {
      setDesignationError("Designation is required");
    } else {
      setDesignationError("");
    }
  };

  // const handleDesignationChange = (e) => {
  //   setValue({ ...value, rm: e.target.value });
  //   if (!e.target.value?.trim()) {
  //     setRmError("Reporting Manager Designation is required");
  //   } else {
  //     setRmError("");
  //   }
  // };

  const handelCheckbox = (e) => {
    setValue({ ...value, check: e.target.checked });
  };

  const handleCreate = () => {
    if (!value.designation?.trim()) {
      if (!value.designation?.trim()) {
        setDesignationError("Designation is required");
      }
      // if (!value.rm?.trim()) {
      //   setRmError("Reporting Manager Designation is required");
      // }
      return;
    }
    let body = {
      designation: value?.designation,
      // rmdsgn: value?.rm,
      isHead: value?.check,
    };
    dispatch(insertDesignation(body));
  };

  useEffect(() => {
    setDesignationModal(modal);
  }, [modal]);

  useEffect(() => {
    if (successDesignation?.data?.status === 200) {
      setValue("");
      setDesignationModal(false);
      closeModal("render");
      ToastHandle("success", "Successfully Created 👍");
    } else if (successDesignation?.data?.status === 400) {
      setDesignationModal(false);
      closeModal();
      ToastHandle("error", "Failed 😔");
    } else if (successDesignation?.data?.status === 401) {
      setDesignationModal(false);
      closeModal();
      ToastHandle("error", successDesignation?.data?.message);
    } else {
      setDesignationModal(false);
      closeModal();
      setValue("");
    }
  }, [successDesignation]);

  const isVicePresident = value.designation === 'Vice President';

  return (
    <div>
      <Modal xs={9} onHide={handleClose} show={designationModal}>
        {successDesignation?.loading ? <MainLoader /> :
          <Modal.Body>
            <>
              <Col className='text-end' lg={12}>
                <CloseButton onClick={handleClose} />
              </Col>
              <Row>
                <Col className='mt-2' lg={12}>
                  <Form.Group>
                    <Row className="mt-1">
                      <Col className="text-center" lg={5}>
                        <Form.Label>Enter Designation : <span className='text-danger'>*</span></Form.Label>
                      </Col>
                      <Col lg={7}>
                        <Form.Group>
                          <Form.Control
                            value={value?.designation}
                            onChange={handleChange}
                            type="text"
                            isInvalid={designationError !== ""}
                          />
                          <Form.Control.Feedback type="invalid">
                            {designationError}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    {/* <Row>
                      <Col className="text-center mt-2" lg={5}>
                        <Form.Label>Reporting Manager Designation : <span className='text-danger'>*</span></Form.Label>
                      </Col>
                      <Col lg={7}>
                        <Form.Group>
                          <Form.Select className='mt-2'
                            value={value?.rm}
                            onChange={handleDesignationChange}
                            required
                            isInvalid={rmError !== ""}
                          >
                            <option value=""> --Select-- </option>
                            {store?.GetDesignationReducer?.getDesignation?.response?.map((ele, ind) => {
                              return (
                                <option key={ele?._id} value={ele?._id}>{ele?.designation}</option>
                              );
                            })}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {rmError}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row> */}
                    {isVicePresident &&
                      <Row>
                        <Col className="text-center" lg={5}>
                          <Form.Check onChange={handelCheckbox} />
                        </Col>
                        <Col lg={7}>
                          <Form.Label>Head</Form.Label>
                        </Col>
                      </Row>}
                  </Form.Group>
                </Col>
              </Row>
              <Col className='text-end mt-2'><Button onClick={handleCreate}>Add</Button> </Col>
            </>
          </Modal.Body>}
      </Modal>
    </div>
  );
}

export default Create;
