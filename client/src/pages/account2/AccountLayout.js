// @flow
import React, { useEffect } from 'react';
// import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// images
import LogoLight from '../../assets/images/logo.png';
import LogoDark from '../../assets/images/logo-dark.png';

type AccountLayoutProps = {
    bottomLinks?: React$Element<any>,
    children?: any,
};

const AccountLayout = ({ bottomLinks, children }: AccountLayoutProps): React$Element<React$FragmentType> => {
    useEffect(() => {
        if (document.body) document.body.classList.add('authentication-bg');

        return () => {
            if (document.body) document.body.classList.remove('authentication-bg');
        };
    }, []);

    const { t } = useTranslation();

    return (
        <>
            {/* <div className="auth-fluid"> */}
                {/* Auth fluid left content */}
                {/* <div className="auth-fluid-form-box">
                    <div className="align-items-center d-flex h-100"> */}
                        {/* <Card.Body> */}
                            {/* logo */}
                            {/* <div className="auth-brand text-center text-lg-start">
                                <Link to="/" className="logo-dark">
                                    <span>
                                        <img src={LogoDark} alt="" height="18" />
                                    </span>
                                </Link>
                                <Link to="/" className="logo-light">
                                    <span>
                                        <img src={LogoLight} alt="" height="18" />
                                    </span>
                                </Link>
                            </div>

                            {children} */}

                            {/* footer links */}
                            {/* {bottomLinks}
                        </Card.Body>
                    </div>
                </div> */}

                {/* Auth fluid right content */}
                {/* <div className="auth-fluid-right text-center">
                    <div className="auth-user-testimonial">
                        <h2 className="mb-3">{t('This is Admin Page')}</h2>
                        <p className="lead">
                            <i className="mdi mdi-format-quote-open"></i>{' '}
                            {t("It's a elegent templete. I love it very much! .")}{' '}
                            <i className="mdi mdi-format-quote-close"></i>
                        </p>
                        <p>{t('- Hyper Admin User')}</p>
                    </div>
                </div>
            </div> */}
 <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5} xxl={4}>
                            <Card>
                                {/* logo */}
                                <Card.Body className="p-4">{children}</Card.Body>
                            </Card>

                            {/* bottom links */}
                            {bottomLinks}
                        </Col>
                    </Row>
                </Container>
            </div>


        </>
    );
};

export default AccountLayout;
