import React, { Fragment, useState } from 'react';
import { Col, Card, CardHeader, Row } from 'reactstrap';
import CountUp from 'react-countup';
import { H6, Image, LI, UL } from '../../../AbstractElements';
import { BOD, ContactUs, ContactUsNumber, DDMMYY, Designer, Email, Follower, Following, LocationDetails, MarekjecnoMailId, MarkJecno, Location } from '../../../Constant';

const UserProfile = () => {
  const [url, setUrl] = useState('');

  const readUrl = (event) => {
    if (event.target.files.length === 0) return;
    var mimeType = event.target.files[0].type;

    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      setUrl(reader.result);
    };
  };
  return (
    <Fragment>
      <Col sm='12'>
        <Card className='hovercard text-center'>
          <CardHeader className='cardheader'></CardHeader>
          <div className='user-image'>
            <div className='avatar'>
              <Image attrImage={{ className: 'step1', alt: '', src: `${url ? url : require('../../../assets/images/user/7.jpg')}` }} />
            </div>
            <div className='icon-wrapper step2' data-intro='Change Profile image here'>
              <i className='icofont icofont-pencil-alt-5' onChange={(e) => readUrl(e)}>
                <input className='upload' type='file' onChange={(e) => readUrl(e)} />
              </i>
            </div>
          </div>
          <div className='info'>
            <Row className='step3' data-intro='This is the your details'>
              <Col sm='6' lg='4' className='order-sm-1 order-xl-0'>
                <Row>
                  <Col md='6'>
                    <div className='ttl-info text-start'>
                      <H6>
                        <i className='fa fa-envelope me-2'></i> {Email}
                      </H6>
                      <span>{MarekjecnoMailId}</span>
                    </div>
                  </Col>
                  <Col md='6'>
                    <div className='ttl-info text-start ttl-sm-mb-0'>
                      <H6>
                        <i className='fa fa-calendar me-2'></i>
                        {BOD}
                      </H6>
                      <span>{DDMMYY}</span>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col sm='12' lg='4' className='order-sm-0 order-xl-1'>
                <div className='user-designation'>
                  <div className='title'>
                    <a target='_blank' href='#javascript'>
                      {MarkJecno}
                    </a>
                  </div>
                  <div className='desc mt-2'>{Designer}</div>
                </div>
              </Col>
              <Col sm='6' lg='4' className='order-sm-2 order-xl-2'>
                <Row>
                  <Col md='6'>
                    <div className='ttl-info text-start ttl-xs-mt'>
                      <H6>
                        <i className='fa fa-phone me-2'></i>
                        {ContactUs}
                      </H6>
                      <span>{ContactUsNumber}</span>
                    </div>
                  </Col>
                  <Col md='6'>
                    <div className='ttl-info text-start ttl-sm-mb-0'>
                      <H6>
                        <i className='fa fa-location-arrow me-2'></i>
                        {Location}
                      </H6>
                      <span>{LocationDetails}</span>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <hr />
            <div className='social-media step4' data-intro='This is your Social details'>
              <UL attrUL={{ horizontal: true, className: 'simple-list list-inline d-flex justify-content-center simple-list' }}>
                <LI attrLI={{ className: 'border-0 list-inline-item' }}>
                  <a href='https://www.facebook.com/'>
                    <i className='fa fa-facebook'></i>
                  </a>
                </LI>
                <LI attrLI={{ className: 'border-0  list-inline-item' }}>
                  <a href='https://accounts.google.com/'>
                    <i className='fa fa-google-plus'></i>
                  </a>
                </LI>
                <LI attrLI={{ className: 'border-0  list-inline-item' }}>
                  <a href='https://twitter.com/'>
                    <i className='fa fa-twitter'></i>
                  </a>
                </LI>
                <LI attrLI={{ className: 'border-0  list-inline-item' }}>
                  <a href='https://www.instagram.com/'>
                    <i className='fa fa-instagram'></i>
                  </a>
                </LI>
                <LI attrLI={{ className: 'border-0  list-inline-item' }}>
                  <a href='https://dashboard.rss.com/auth/sign-in/'>
                    <i className='fa fa-rss'></i>
                  </a>
                </LI>
              </UL>
            </div>
            <div className='follow'>
              <Row>
                <Col col='6' className='border-end text-center'>
                  <CountUp end={25869} className='follow-num counter d-grid' />
                  <span>{Follower}</span>
                </Col>
                <Col col='6' className='text-center'>
                  <CountUp end={659887} className='follow-num counter d-grid' />
                  <span>{Following}</span>
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      </Col>
    </Fragment>
  );
};

export default UserProfile;
