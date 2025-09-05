import React, { Fragment } from "react";
import { Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import Basic from "./Basic";
import CustomAutocloseClass from "./CustomAutoclose";
import CustomDirectionsClass from "./CustomDirections";

// toast.configure();

const BootstrapNotifyContain = () => {
  return (
    <Fragment>
      <Breadcrumbs mainTitle='Bootstrap Notify' parent='Bonus Ui' title='Bootstrap Notify' />
      <Container fluid={true}>
        <Row>
          <Basic />
          <CustomDirectionsClass />
          <CustomAutocloseClass />
        </Row>
      </Container>
    </Fragment>
  );
};

export default BootstrapNotifyContain;
