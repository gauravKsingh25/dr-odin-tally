import React, { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import { Row, Col, Card, Form, Table, CloseButton, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { companyStatusAction } from '../../../../redux/actions';
import ToastHandle from '../../../../constants/Toaster/Toaster';
import MainLoader from '../../../../components/MainLoader';
function Edit({ modal, closeModal, data }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const store = useSelector((state) => state)
  const dispatch = useDispatch();
  const successHandle = store?.companyStatusReducer?.status
  const loaderHandle = store?.companyStatusReducer
  const errorHandle = store?.companyStatusReducer?.status
  const [loader, setloader] = useState(false)
  const [dataa, SetDataa] = useState({ name: '',username:"", phoneno: "", email: "", password: "", confirmPassword: "", gstno: "", taxationid: "", personname: "", personphoneno: "", personemail: "", logo: "" })
  const [show, setShow] = useState(true)

  const handelCross = () => {
    setShow(!show)
  }
  const handleCloseModal = () => {
    closeModal()
  };
  const onSubmit = (dataa) => {
    let body = new FormData();
    body.append("cid", data?._id)
    body.append("company", dataa?.name)
    body.append("username", dataa?.username)
    body.append("mobile", dataa?.phoneno)
    body.append("email", dataa?.email)
    body.append("password", dataa?.password)
    body.append("gstNo", dataa?.gstno)
    body.append("taxationId", dataa?.taxationid)
    body.append("name", dataa?.personname)
    body.append("phone", dataa?.personphoneno)
    body.append("emailId", dataa?.personemail)
    if (!show) {
      body.append("logo", dataa?.logo[0])
    }

    dispatch(companyStatusAction(body))
  };
  useEffect(() => {
    setShow(true)
    reset({
      name: data?.company,
      username: data?.username,
      phoneno: data?.mobile,
      email: data?.email,
      password: data?.password,
      gstno: data?.gstNo,
      taxationid: data?.taxationId,
      personname: data?.name,
      personphoneno: data?.phone,
      personemail: data?.emailId,
      logo: data?.logo[0],
    })

  }, [modal])
  useEffect(() => {
    if (loaderHandle?.loading) {
      setloader(true)

    }
    else if (successHandle == 200) {
      ToastHandle("success", "successfully Updated")
      closeModal("render")
      reset()
    }
    else if (errorHandle == 401) {
      ToastHandle("error", store?.companyStatusReducer?.message)
    }
    else if (errorHandle == 405) {
      ToastHandle("error", "Something went wrong")
    }
  }, [successHandle, errorHandle])

  return (
    <>
      <Modal xs={9} size={"xl "} onHide={handleCloseModal} show={modal}>
        <Modal.Body className='px-4 py-2'>
          <Row>
            <Col className="text-start m-0 p-0" lg={6} >
              <h4 className='pt-0 mt-0 ps-0 ms-0'> Edit Company Detail</h4>
            </Col>
            <Col className="text-end m-0 p-0" lg={6}>
              <CloseButton onClick={handleCloseModal} />
            </Col>

            <Card className=''>
              {loaderHandle?.loading ? <MainLoader /> :
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
                                  <Form.Control {...register("username", {
                                    required: true,
                                  })}
                                    type="text"
                                    name="username"
                                    placeholder="Enter User Name"
                                  />
                                  {errors?.username?.type == "required" && <span className="text-danger"> User Name is required *</span>}
                                
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
                                    name="phoneno"
                                    type="number"
                                    placeholder="Enter Phone Number"


                                    {...register("phoneno", { required: true, maxLength: 10 , minLength: 10 })}
                                  />
                                  {errors?.phoneno?.type == "minLength" && <span className="text-danger"> Minimum 10 Number are allowed</span>}
                                  {errors?.phoneno?.type == "required" && <span className="text-danger"> Phne no is required *</span>}
                                  {errors?.phoneno?.type == "maxLength" && <span className="text-danger"> Only 10 Number are allowed</span>}

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
                                <Form.Group className="" >
                                  <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Enter Password"
                                    {...register('password', { required: true, })}
                                  />
                                  {errors.password?.type == 'required' && (
                                    <span className="text-danger">Password is required *</span>
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6}>
                            <Row>
                              <Col lg={12}>
                                <Form.Label className='' >
                                  Logo <span className="text-danger">*</span> :
                                </Form.Label>
                              </Col>
                              <Col lg={12}>

                                <Form.Group className="" >
                                  {show ? <div style={{ width: '40%', position: 'relative' }}>
                                    <div className="img_div">
                                      <img className="w-100" src={data?.logo} />
                                    </div>
                                    <div
                                      className="cross_div"
                                      style={{ position: 'absolute', rigth: '0' }}>
                                      <i
                                        className=" dripicons-cross"
                                        onClick={handelCross}
                                      ></i>
                                    </div>
                                  </div> :
                                    <Form.Control
                                      type="file"
                                      accept="image/png,   image/jpeg"
                                      name="logo"
                                      {...register('logo', { required: true })}
                                    />}


                                  {errors.logo && <span className="text-danger"> Logo is required *</span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
                         
                        </Row>
                      </Col>
                    </Row>
                    <Row className='mt-2 mb-3'>
                      <Col lg={12}>
                        <Row>
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
                                  {errors?.gstno?.type == "minLength" && <span className="text-danger"> Minimum 15 Words are allowed</span>}
                                  {errors?.gstno?.type == "maxLength" && <span className="text-danger"> Only 15 Words are allowed</span>}
                                  {errors.gstno?.type=="required" && <span className="text-danger"> GST Number is required *</span>}
                                  {errors?.gstno?.type == "pattern" && <span className="text-danger">{errors?.gstno?.message} </span>}
                                </Form.Group>
                              </Col>
                            </Row>
                          </Col>
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
                                      maxLength: 10, minLength: 10

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
                        </Row>
                      </Col>
                    </Row>
                    <hr />
                    <p>Other Contact Person Detail :</p>
                    <Row className='mt-2 '>
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
                                  <Form.Control {...register('personphoneno', { required: false, maxLength: 10 ,minLength:10 })}
                                    type="number"
                                    name="personphoneno"
                                    placeholder="Enter Phone Number"
                                  />
                                      {errors?.personphoneno?.type == "minLength" && <span className="text-danger"> Minimum 10 Number are allowed</span>}
                                  {errors?.personphoneno?.type == "maxLength" && <span className="text-danger"> Only 10 Number are allowed</span>}

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

                      <Button type='submit' className='submit-btn btn-secondary' >Update</Button>

                    </Col>
                  </Form>
                </Card.Body>}
            </Card>
          </Row>
        </Modal.Body>
      </Modal>
    </>

  )
}

export default Edit