const client = require("./redis");

module.exports.processData = async (dataString, mapOfVehicles) => {
  try {
    const data = JSON.parse(dataString);
    if (data && data[0]) {
      data.forEach((datum) => {
        if (mapOfVehicles[datum.vehicleId]) {
          console.log(
            new Date(mapOfVehicles[datum.vehicleId].timestamp) <
              new Date(datum.timestamp),
            new Date(mapOfVehicles[datum.vehicleId].timestamp),
            new Date(datum.timestamp)
          );
          if (
            new Date(mapOfVehicles[datum.vehicleId].timestamp) <
            new Date(datum.timestamp)
          ) {
            mapOfVehicles[datum.vehicleId] = {
              timestamp: datum.timestamp,
              lat: datum.lat,
              lon: datum.lon,
            };
          }
        } else {
          mapOfVehicles[datum.vehicleId] = {
            timestamp: datum.timestamp,
            lat: datum.lat,
            lon: datum.lon,
          };
        }
      });
    } else if (data.vehicleId) {
      if (mapOfVehicles[data.vehicleId]) {
        if (
          new Date(mapOfVehicles[data.vehicleId].timestamp) >
          new Date(data.timestamp)
        ) {
          mapOfVehicles[data.vehicleId] = {
            timestamp: data.timestamp,
            lat: data.lat,
            lon: data.lon,
          };
        }
      } else {
        mapOfVehicles[data.vehicleId] = {
          timestamp: data.timestamp,
          lat: data.lat,
          lon: data.lon,
        };
      }
    }
  } catch (e) {
    console.log(e);
  }
};
