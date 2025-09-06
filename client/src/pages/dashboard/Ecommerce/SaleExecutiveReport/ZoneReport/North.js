import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import '../../../../../style.css';
import '../../../Ecommerce/style.css';
import MainLoader from '../../../../../components/MainLoader';
import { getBdeAction } from '../../../../../redux/actions';

function North() {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [fullmode, setFullmode] = useState(false);
    const [northdata, setNorthData] = useState([]);
    const loaderHandel = store?.NorthZoneReportReducer;
    const bdeData = store?.BdeListReducer;

    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x);
    };
    useEffect(() => {
        setNorthData(store?.NorthZoneReportReducer?.northzonereport);
    }, []);
    const handleEpandRow = (event, userId) => {
        dispatch(getBdeAction(userId));
        let res = {
            ...northdata,
            response: northdata?.response?.map((ele) =>
                ele?.mid === userId ? { ...ele, show: !ele?.show } : { ...ele, show: false }
            ),
        };
        setNorthData(res);
      
    };
    return (
        <>
            {loaderHandel?.loading ? (
                <MainLoader />
            ) : (
                <Card>
                    <Card.Body>
                        <h1 className="header-title font-20 text-center">
                            NORTH ZONE - {northdata?.HeadOfZone?.name}{' '}
                        </h1>

                        <Table responsive className="table-centered mb-0  mt-2 " size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Designation</th>
                                    <th>Salary Exp.</th>
                                    <th> Expense</th>
                                    <th> Total Expenditure</th>
                                    <th> Ytd </th>
                                    <th> Ytd Ach </th>
                                    <th> Ytd % </th>
                                    <th> BDE </th>
                                </tr>
                            </thead>
                            <tbody>
                                {northdata?.response?.map((ele) => (
                                    <>
                                        <tr
                                            onClick={(event) => handleEpandRow(event, ele?.mid)}
                                            key={ele?.mid}
                                            style={{ backgroundColor: ele?.color, color: 'black', fontWeight: '600' }}>
                                            <td scope="row">{ele?.name}</td>
                                            <td>{ele?.dsgn}</td>
                                            <td>₹{INR_Format(ele?.slry)}</td>
                                            <td>₹{INR_Format(ele?.expns)}</td>
                                            <td>₹{INR_Format(ele?.totExp)}</td>
                                            <td>₹{INR_Format(ele?.ytrgt)}</td>
                                            <td>₹{INR_Format(ele?.ytdAch)}</td>
                                            <td>{INR_Format(ele?.totAchPer)} %</td>

                                            <td variant="link" onClick={(event) => handleEpandRow(event, ele?.mid)}>
                                                <i
                                                    style={{ cursor: 'pointer' }}
                                                    className={
                                                        ele?.show
                                                            ? '  dripicons-chevron-up font-20  '
                                                            : '  dripicons-chevron-down font-20  '
                                                    }></i>
                                            </td>
                                        </tr>
                                        <>
                                            {ele.show ? (
                                                <>
                                                    {bdeData.loading ? (
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <MainLoader />
                                                            <td></td>
                                                        </tr>
                                                    ) : (
                                                        <>
                                                            {bdeData.bdelist?.response?.length>0 && bdeData.bdelist?.response?.map((ele, ind) => {
                                                                return (
                                                                    <tr
                                                                        key={ind}
                                                                        style={{
                                                                            backgroundColor: ele?.color,
                                                                            color: 'black',
                                                                            fontWeight: '600',
                                                                        }}>
                                                                        <td scope="row">{ele?.name}</td>
                                                                        <td>{ele?.dsgn}</td>
                                                                        <td>₹{INR_Format(ele?.salary)}</td>
                                                                        <td>₹{INR_Format(ele?.expns)}</td>
                                                                        <td>₹{INR_Format(ele?.totExp)}</td>
                                                                        <td>₹{INR_Format(ele?.ytrgt)}</td>
                                                                        <td>₹{INR_Format(ele?.ytdAch)}</td>
                                                                        <td>{INR_Format(ele?.totYtdPer)} %</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {bdeData.bdelist?.response?.length>0 && <tr
                                                                style={{
                                                                    backgroundColor: 'rgb(183 188 188)',
                                                                    color: 'black',
                                                                    fontWeight: '600',
                                                                }}>
                                                                <td className="fw-bold" scope="row">
                                                                    TOTAL
                                                                </td>
                                                                <td className="fw-bold"></td>
                                                                <td className="fw-bold ">
                                                                    ₹
                                                                    {INR_Format(
                                                                        bdeData?.bdelist?.coltot[0]?.totSlry
                                                                            ? bdeData?.bdelist?.coltot[0]?.totSlry
                                                                            : 0
                                                                    )}
                                                                </td>
                                                                <td className="fw-bold">
                                                                    ₹
                                                                    {INR_Format(
                                                                        bdeData?.bdelist?.coltot[0]?.totExpns
                                                                            ? bdeData?.bdelist?.coltot[0]?.totExpns
                                                                            : 0
                                                                    )}
                                                                </td>
                                                                <td className="fw-bold">
                                                                    ₹
                                                                    {INR_Format(
                                                                        bdeData?.bdelist?.coltot[0]?.totExpenditure
                                                                            ? bdeData?.bdelist?.coltot[0]
                                                                                  ?.totExpenditure
                                                                            : 0
                                                                    )}
                                                                </td>
                                                                <td className="fw-bold">
                                                                    ₹
                                                                    {INR_Format(
                                                                        bdeData?.bdelist?.coltot[0]?.totYtd
                                                                            ? bdeData?.bdelist?.coltot[0]?.totYtd
                                                                            : 0
                                                                    )}
                                                                </td>
                                                                <td className="fw-bold">
                                                                    ₹
                                                                    {INR_Format(
                                                                        bdeData?.bdelist?.coltot[0]?.totYtdAch
                                                                            ? bdeData?.bdelist?.coltot[0]?.totYtdAch
                                                                            : 0
                                                                    )}
                                                                </td>
                                                                <td className="fw-bold">
                                                                    {INR_Format(
                                                                        bdeData?.bdelist?.coltot[0]?.totYtdPer
                                                                            ? bdeData?.bdelist?.coltot[0]?.totYtdPer
                                                                            : 0
                                                                    )}{' '}
                                                                    %
                                                                </td>
                                                                <td></td>
                                                            </tr>}
                                                        </>
                                                    )}{' '}
                                                </>
                                            ) : null}
                                        </>
                                    </>
                                ))}

                                <tr className="table-dark">
                                    <th>TOTAL</th>
                                    <th>{northdata?.HeadOfZone?.dsgn}</th>
                                    <th>₹ {INR_Format(northdata?.HeadOfZone?.slry?northdata?.HeadOfZone?.slry:0)}</th>
                                    <th>₹ {INR_Format(northdata?.HeadOfZone?.expns?northdata?.HeadOfZone?.expns:0)}</th>
                                    <th>₹ {INR_Format(northdata?.HeadOfZone?.totExpenditure?northdata?.HeadOfZone?.totExpenditure:0)}</th>
                                    <th>₹ {INR_Format(northdata?.HeadOfZone?.ytrgt?northdata?.HeadOfZone?.ytrgt:0)} </th>
                                    <th>₹ {INR_Format(northdata?.HeadOfZone?.totAch?northdata?.HeadOfZone?.totAch:0)}</th>
                                    <th> {INR_Format(northdata?.HeadOfZone?.totAchPer?northdata?.HeadOfZone?.totAchPer:0)} %</th>
                                    <th> </th>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </>
    );
}

export default North;
