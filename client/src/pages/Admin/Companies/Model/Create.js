import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import { Row, Col, Card, Form, Table, CloseButton, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import "../../style.css"
import { createCompanyAction } from '../../../../redux/Admin/action';
import ToastHandle from "../../../../constants/Toaster/Toaster";
import MainLoader from '../../../../components/MainLoader';
function Create({ modal, close }) {
  const dispatch = useDispatch();
  const store = useSelector((state) => state)
  const successHandle = store?.companyCreateReducer
  const createLoader = store?.companyCreateReducer
  const errorHandle = store?.companyCreateReducer
  const [loader, setloader] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [confirmPassError, setConfirmPassError] = useState(false)
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [data, SetData] = useState({ name: '',username:"", phoneno: "", email: "", password: "", confirmPassword: "", gstno: "", taxationid: "", personname: "", personphoneno: "", personemail: "", logo: "" })
  const handleCloseModal = () => {
    close()
  };

  const handelconfirmpassword = (e) => {
    SetData({ ...data, confirmPassword: e.target.value })
    let password = watch("password")

    if (password == e.target.value) {
      setConfirmPassError(false)
    }
    else {
      setConfirmPassError(true)
    }

  }

  const onSubmit = (value) => {
    if (value.confirmPassword === value.password) {


      let body = new FormData();
      body.append("company", value?.name)
      body.append("username", value?.username)
      body.append("mobile", value?.phoneno)
      body.append("email", value?.email)
      body.append("password", value?.password)
      body.append("gstNo", value?.gstno)
      body.append("taxationId", value?.taxationid)
      body.append("name", value?.personname)
      body.append("phone", value?.personphoneno)
      body.append("emailId", value?.personemail)
      body.append("logo", value?.logo[0])

      dispatch(createCompanyAction(body))
    }
    else {
      setConfirmPassError(true)
    }
  };
  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text")
      return;
    }
    setPasswordType("password")
  }
  const toggleconfirmPassword = () => {
    if (confirmPasswordType === "password") {
      setConfirmPasswordType("text")
      return;
    }
    setConfirmPasswordType("password")
  }
  useEffect(() => {
    if (createLoader?.loading) {
      setloader(true)
    }
    else if (successHandle?.status == 200) {
      ToastHandle("success", "successfully created")
      close("render")
      reset()
    }
    else if (errorHandle?.status == 401) {
      ToastHandle("error", store?.companyCreateReducer?.message)
    }
    else if (errorHandle?.status == 405) {
      ToastHandle("error", "Something went wrong")
    }
  }, [successHandle, errorHandle])

  useEffect(() => {
    setConfirmPassError(false)
  }, [modal])

  return (

    <>
      <Modal xs={9} size={"xl "} onHide={handleCloseModal} show={modal}>
        <Modal.Body className='px-4 py-2'>
          {createLoader?.loading ? <MainLoader /> :
            <Row>
              <Col className="text-start m-0 p-0" lg={6} >
                <h4 className='pt-0 mt-0'> Create Company </h4>
              </Col>
              <Col className="text-end m-0 p-0" lg={6}>
                <CloseButton onClick={handleCloseModal} />
              </Col>
              <Card className=''>
                <Card.Body>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                      <Col lg={12}>
                        <Row>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Company Name <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control {...register("name", {
                                    required: true,
                                    pattern: {
                                      value: /^[a-zA-Z ]*$/,
                                      message: "Only Alphabets are allowed",

                                    }
                                  })}
                                    type="text"
                                    name="name"
                                    placeholder="Enter Name"
                                  />
                                  {errors?.name?.type == "required" && <span className="text-danger">  Company Name is required *</span>}
                                  {errors?.name?.type == "pattern" && <span className="text-danger"> {errors?.name?.message}</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  User Name <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    name="username"
                                    type="text"
                                    placeholder="Enter User Name"


                                    {...register("username", { required: true, })}
                                  />
                                  {errors?.username?.type == "required" && <span className="text-danger"> username is required *</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row className='mt-2'>
                      <Col lg={12}>
                        <Row>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Phone number <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    name="number"
                                    type="number"
                                    placeholder="Enter Phone Number"


                                    {...register("phoneno", { required: true, maxLength: 10, minLength: 10 })}
                                  />
                                  {errors?.phoneno?.type == "required" && <span className="text-danger"> Phone no is required *</span>}
                                  {errors?.phoneno?.type == "maxLength" && <span className="text-danger"> Only 10 Number are allowed</span>}
                                  {errors?.phoneno?.type == "minLength" && <span className="text-danger">  Minimum 10 Number are allowed</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  E-mail <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    type="text"
                                    name="mail"
                                    placeholder="Enter E-mail Address"
                                    {...register("email", {
                                      required: true,
                                      pattern: {
                                        value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

                                      },
                                    })}
                                  />
                                  {errors?.email?.type == "required" && <span className="text-danger">  E-mail is required *</span>}
                                  {errors?.email?.type == "pattern" && <span className="text-danger">Please enter a valid email</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          
                        </Row>
                      </Col>
                    </Row>
                    <Row className='mt-2'>
                      <Col lg={12}>
                        <Row>
                        <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Password <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <div className='custom_Input'>
                                  <Form.Group className="" >
                                    <Form.Control
                                      className='inner_Input'
                                      type={passwordType}
                                      name="password"
                                      placeholder="Enter Password"
                                      {...register('password', { required: true, })}
                                    />
                                  </Form.Group>
                                  <button className="custom_Btn" onClick={togglePassword}>
                                    {passwordType === "password" ?
                                      <i className="mdi mdi-eye-off"></i>
                                      :
                                      <i className=" mdi mdi-eye"></i>
                                    }
                                  </button>
                                </div>
                                {errors.password?.type == 'required' && (
                                  <span className="text-danger">Password is required *</span>
                                )}
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Confirm Password <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <div className='custom_Input'>
                                  <Form.Group className="" >
                                    <Form.Control className='inner_Input' onChange={(e) => handelconfirmpassword(e)}
                                      type={confirmPasswordType}
                                      name='confirmPassword'
                                      placeholder="Enter Confirm Password"
                                      {...register('confirmPassword', { required: true })}
                                    />
                                  </Form.Group>
                                  <button className="custom_Btn" onClick={toggleconfirmPassword}>
                                    {confirmPasswordType === "password" ?
                                      <i className="mdi mdi-eye-off"></i>
                                      :
                                      <i className=" mdi mdi-eye"></i>
                                    }
                                  </button>
                                </div>
                                {confirmPassError && <p className='text-danger font-14 m-0 p-0'>Password didn't match</p>}
                                {errors.confirmPassword?.type == 'required' && (
                                  <span className="text-danger">Password is required *</span>
                                )}
                              </Col>
                            </Row>
                          </Col>
                          
                        </Row>
                      </Col>
                    </Row>
                    <Row className='mt-2 '>
                      <Col lg={12}>
                        <Row>
                        <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Logo <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    type="file"
                                    accept="image/png,   image/jpeg"
                                    name="logo"
                                    {...register('logo', { required: true })}
                                  />
                                  {errors.logo && <span className="text-danger"> Logo is required *</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  GST No <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    type="text"
                                    placeholder="Enter GST number"
                                    name=" gstno"
                                    {...register('gstno', {
                                      required: true,
                                      pattern: {
                                        value: /^[a-zA-Z0-9_.-]*$/,
                                        message: "Only Alphabets & Numbers are allowed",

                                      },
                                      maxLength: 15, minLength: 15

                                    })}

                                  />
                                  {errors?.gstno?.type == "minLength" && <span className="text-danger">   Minimum 15 Words are allowed</span>}
                                  {errors?.gstno?.type == "maxLength" && <span className="text-danger"> Only 15 Words are allowed</span>}
                                  {errors?.gstno?.type == "pattern" && <span className="text-danger">{errors?.gstno?.message} </span>}
                                  {errors.gstno?.type == 'required' && (
                                    <span className="text-danger"> GST No is required *</span>
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          
                        </Row>
                      </Col>
                    </Row>
                    <Row className='mt-2 mb-3'>
                    <Col lg={12}>
                    <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Taxation Id :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    {...register('taxationid', {
                                      required: false,
                                      pattern: {
                                        value: /^[a-zA-Z0-9_.-]*$/,
                                        message: "Only Alphabets & Numbers are allowed",

                                      },
                                      maxLength: 10, minLength: 10,

                                    })}
                                    type="text"
                                    name="taxationid"
                                    placeholder="Enter Taxation Id"
                                  />
                                  {errors?.taxationid?.type == "minLength" && <span className="text-danger"> Minimum 10 Words are allowed</span>}
                                  {errors?.taxationid?.type == "maxLength" && <span className="text-danger"> Only 10 Words are allowed</span>}
                                  {errors?.taxationid?.type == "pattern" && <span className="text-danger">{errors?.taxationid?.message} </span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                    </Col>
                    </Row>
                    <hr />
                    <p>Other Contact Person Detail :</p>
                    <Row className='mt-2'>
                      <Col lg={12}>
                        <Row>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Name :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control {...register('personname', {
                                    required: false,
                                    pattern: {
                                      value: /^[a-zA-Z ]*$/,
                                      message: "Only Alphabets are allowed",

                                    }
                                  })}
                                    type="text"
                                    name="personname"
                                    placeholder="Enter Name"
                                  />
                                  {errors?.personname?.type == "pattern" && <span className="text-danger"> {errors?.personname?.message}</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Phone No. :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control {...register('personphoneno', { required: false, maxLength: 10, minLength: 10 })}
                                    type="number"
                                    name="personphoneno"
                                    placeholder="Enter Phone Number"
                                  />
                                  {errors?.personphoneno?.type == "maxLength" && <span className="text-danger"> Only 10 Number are allowed</span>}
                                  {errors?.personphoneno?.type == "minLength" && <span className="text-danger"> Minimum 10 Number are allowed</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row className='mt-2'>
                      <Col lg={12}>
                        <Row>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  E-mail :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>
                                <Form.Group className="" >
                                  <Form.Control
                                    {...register("personemail", {
                                      required: false,
                                      pattern: {
                                        value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

                                      },
                                    })}
                                    type="text"
                                    placeholder="Enter E-mail Address"
                                    name="personemail"
                                  />
                                  {errors?.personemail?.type == "pattern" && <span className="text-danger">Please enter a valid email</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Col lg={12} className="text-center mt-3 ">


                      <Button type='submit' className='submit-btn btn-secondary' >Create</Button>
                      <Button type="reset" className="btn reset-btn ms-3 " onClick={() => { reset() }} >Reset</Button>
                    </Col>
                  </Form>
                </Card.Body>
              </Card>
            </Row>}
        </Modal.Body>
      </Modal>

    </>
  )
}

export default Create