// @flow
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = (): React$Element<any> => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="container-fluid">
                <Row>
                    <Col md={6}>{currentYear} © Dr. Odin</Col>

                    <Col md={6}>
                        <div className="text-md-end footer-links d-none d-md-block">
                            <Link to="https://www.rowthtech.com/" target = "_blank"> Powered by <u>RowthTech</u></Link>
                           
                        </div>
                    </Col>
                </Row>
            </div>
        </footer>
    );
};

export default Footer;
