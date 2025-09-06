import React, { useState, useEffect } from 'react';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import { getDesignationByPost } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDesignation } from '../../../redux/setting/action';
import MainLoader from '../../../components/MainLoader';
import Create from './create';
import Update from './update';
import ToastHandle from '../../../constants/Toaster/Toaster';
function Designation() {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const successHandle = store?.GetDesignationReducer;
    const successDeleteHandle = store?.deleteDesignationReducer
    const [openModal, setOpenModal] = useState(false)
    const [updateModal, setUpdateModal] = useState(false)
    const [render, setRender] = useState(false)
    const [updateData, setUpdateData] = useState()
    const [deleteModal, setDeletemodal] = useState(false)
    const [deleteId, setDeleteId] = useState("")
    const handleDesignation = () => {
        setOpenModal(true)
    };
    const handleCloseModal = (data) => {
        if (data === "render") {
            setRender(!render)
        }
        setOpenModal(false)
    };
    const closeUpdateModal = (data) => {
        if (data === "render") {
            setRender(!render)
        }
        setUpdateModal(false)
    }
    const handleUpdate = (data) => {
        if (data?.designation !== "Vice President") {
            setUpdateModal(true)
            setUpdateData(data)
        }

    }
    const handleDelete = (data) => {
        if (data?.designation !== "Vice President") {
            setDeleteId(data?._id)
            setDeletemodal(true)
        }

    }

    const handleDeleteModal = () => {
        dispatch(deleteDesignation(deleteId))
        setDeletemodal(false)

    }
    const [searchss, setSearchss] = useState('')
    useEffect(() => {
        dispatch(getDesignationByPost({ search: searchss }));
    }, [render]);

    useEffect(() => {
        if (successDeleteHandle?.data?.status == 200) {
            setRender(!render)
            ToastHandle("success", "Deleted Successfully")
        }
    }, [successDeleteHandle])


    return (
        <>
            <>
                <Card>
                    {successHandle?.loading ? (
                        <MainLoader />
                    ) : (
                        <Card.Body>
                            <Row>
                                <Col className="text-end" lg={12}>
                                    <Button className=" rounded-pill " onClick={handleDesignation}>
                                        {' '}
                                        Create Designation
                                    </Button>
                                </Col>
                            </Row>

                            <Table className="table-centered mb-0 mt-2">
                                <thead className="table-dark">
                                    <tr>
                                        <th className='w-25'>Sr no.</th>
                                        <th className='w-25'> Designation </th>
                                        <th className='w-25'>  Reporting Manager</th>
                                        <th className='w-25'>Update</th>
                                        <th className='w-25'>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {store?.GetDesignationReducer?.getDesignation?.response?.map((record, index) => {
                                        return (
                                            <tr key={index}>
                                                <td scope="row">{index + 1}</td>
                                                <td>{record?.designation}</td>
                                                <td>{record?.rmdsgn?.designation}</td>
                                                <td>
                                                    <i
                                                        style={{ cursor: 'pointer' }}
                                                        className="dripicons-document-edit"
                                                        onClick={record.designation !== 'Vice President' ? () => handleUpdate(record) : null}
                                                        title={record.designation === 'Vice President' ? "You can't edit Vice President" : ""}
                                                    ></i>
                                                </td>
                                                <td>
                                                    <i
                                                        style={{ cursor: 'pointer' }}
                                                        className="dripicons-trash"
                                                        onClick={record.designation !== 'Vice President' ? () => handleDelete(record) : null}
                                                        title={record.designation === 'Vice President' ? "You can't delete Vice President" : ""}
                                                    ></i>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    )}
                </Card>
            </>
            <Create modal={openModal} closeModal={handleCloseModal} />
            <Update modal={updateModal} closeModal={closeUpdateModal} data={updateData} />









            {/* delete modal starts */}

            <Modal show={deleteModal} onHide={() => { setDeletemodal(false) }} >
                <Modal.Header >
                    <Modal.Title>Are you sure! You want to delete </Modal.Title>
                </Modal.Header>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setDeletemodal(false) }} >
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
export default Designation;
