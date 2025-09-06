import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Row, Col, CloseButton, Form } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import Create from './Model/create';
import { getZoneAction } from '../../../redux/actions';
import { getState, deletState } from '../../../redux/setting/action';
import MainLoader from '../../../components/MainLoader';
import Update from './Model/update';
import ToastHandle from '../../../constants/Toaster/Toaster';
function State() {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const getStateSuccessHandle = store?.getStateReducer;
    const deleteStateSuccessHandle = store?.deleteStateReducer;
    const [openStateModel, setOpenStateModel] = useState(false);
    const [updateStateModel, setUpdateStateModel] = useState(false);
    const [render, setRender] = useState(true);
    const [updatedStateValue, setUpdatedStateValue] = useState('');
    const [deleteModal, setDeletemodal] = useState(false);
    const [deleteId, setDeleteId] = useState("")

    const hanldeState = () => {
        setOpenStateModel(true);
    };
    const handleUpdateState = (data) => {
        setUpdatedStateValue(data);
        setUpdateStateModel(true);
    };
    const handleCreateCity = () => { };
    const closeStateModal = (data) => {
        if (data == 'render') {
            setRender(!render);
        }
        setOpenStateModel(false);
    };
    const handleDelete = (data) => {
        setDeleteId(data?._id)
        setDeletemodal(true)
    };

    const handleDeleteModal = () => {
        dispatch(deletState(deleteId));
        setDeletemodal(false)

    }

    const closeupdateStateModal = (data) => {
        if (data == 'render') {
            setRender(!render);
        }
        setUpdateStateModel(false);
    };

    useEffect(() => {
        dispatch(getState());
        dispatch(getZoneAction());
    }, [render]);

    useEffect(() => {
        if (deleteStateSuccessHandle.data.status == 200) {
            setRender(!render);
            ToastHandle("success", "Successfully Deleted 👍")
        }
    }, [deleteStateSuccessHandle])


    return (
        <>
            {getStateSuccessHandle?.loading ? (
                <MainLoader />
            ) : (
                <Card.Body>
                    <Row>
                        <Col className="text-end" lg={12}>
                            <Button className=" rounded-pill " onClick={hanldeState}>
                                {' '}
                                Create State
                            </Button>
                        </Col>
                    </Row>

                    <Table className="table-centered mb-0 mt-2">
                        <thead className="table-dark">
                            <tr>
                                <th >Sr no.</th>
                                <th >State </th>
                                {/* <th> Create City</th> */}
                                <th > Update State</th>
                                <th > Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {store?.getStateReducer?.data?.response?.map((record, index) => {
                                return (
                                    <tr key={index}>
                                        <td scope="row">{index + 1}</td>
                                        <td>{record?.state}</td>

                                        <td>
                                            {' '}
                                            <>
                                                {' '}
                                                <i
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleUpdateState(record)}
                                                    className="dripicons-document-edit"></i>
                                            </>
                                        </td>
                                        <td>
                                            <i
                                                style={{ cursor: 'pointer' }}
                                                className=" dripicons-trash"
                                                onClick={() => handleDelete(record)}></i>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            )}
            <Create modal={openStateModel} closeModal={closeStateModal} />
            <Update modal={updateStateModel} closeModal={closeupdateStateModal} data={updatedStateValue} />


            {/* delete modal starts */}

            <Modal show={deleteModal} onHide={() => { setDeletemodal(false) }} >
                <Modal.Header >
                    <Modal.Title>Are you sure you want to delete? This action will also delete associated employees and cities.</Modal.Title>
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
export default State;
