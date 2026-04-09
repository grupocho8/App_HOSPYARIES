//import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const Habitaciones = () => {
  return (
    <Container className="mt-3">
      <Row className="aling-items-center">
        <Col>
          <h2><i className="bi-door-open-fill me-2"></i> Habitaciones</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Habitaciones;