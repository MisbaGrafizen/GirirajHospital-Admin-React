import { GoogleMap, Polygon, useJsApiLoader } from "@react-google-maps/api";
import React, { Fragment } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { Polygons } from "../../../Constant";
import HeaderCard from "../../Common/Component/HeaderCard";

const containerStyle = {
  height: "500px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const PolygonsComp = () => {
  const polygontriangleCoords = [
    { lat: 25.774, lng: -80.19 },
    { lat: 18.466, lng: -66.118 },
    { lat: 32.321, lng: -64.757 },
    { lat: 25.774, lng: -80.19 },
  ];

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBkNaAGLEVq0YLQMi-PYEMabFeREadYe1Q&v=3.exp&libraries=geometry,drawing,places",
  });

  return (
    <Fragment>
      <Col xl='6' md='12'>
        <Card>
          <HeaderCard title={Polygons} />
          <CardBody>
            <div className='map-js-height'>
              <div id='gmap-simple' className='map-block'>
                {isLoaded ? (
                  <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                    <Polygon paths={polygontriangleCoords} strokeColor='#FF0000' strokeOpacity={0.8} strokeWeight={2} fillColor='#FF0000' fillOpacity={0.35} />
                  </GoogleMap>
                ) : (
                  "LOADING...."
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Fragment>
  );
};

export default PolygonsComp;
