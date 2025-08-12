// src/components/Navbar.jsx

import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

export default function AppNavbar() {
  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand href="/" className="font-bold text-xl">
          SafeHaven
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/" className="hover:text-blue-600">Home</Nav.Link>
            <Nav.Link href="/about" className="hover:text-blue-600">About</Nav.Link>
            <NavDropdown title="Services" id="basic-nav-dropdown">
              <NavDropdown.Item href="/service1">Service 1</NavDropdown.Item>
              <NavDropdown.Item href="/service2">Service 2</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/contact" className="hover:text-blue-600">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
