//import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const Reservaciones = () => {
  return (
    <Container className="mt-3">
      <Row className="aling-items-center">
        <Col>
          <h2><i className="bi-calendar-check-fill"></i> Reservaciones</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Reservaciones;