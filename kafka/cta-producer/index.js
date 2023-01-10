const Kafka = require("node-rdkafka");
var cta = require("cta-bus-tracker");

const stream = Kafka.Producer.createWriteStream(
  {
    "metadata.broker.list": "localhost:9092",
    "queue.buffering.max.messages": 100000,
  },
  {},
  {
    topic: "tracking",
  }
);

stream.on("error", (err) => {
  console.error("Error in our kafka stream");
  console.error(err);
});

var busTracker = new cta("vPfbikZwhUMXtJCuhuJqARRBG");

async function queueCurrentLocation() {
  busTracker.routes((err, data) => {
    if (err) {
      console.log(err);
    } else {
      const routes = data.map((route) => route.rt);
      // split routes to arrays where each array contain max 9 elements
      const routesArrays = routes.reduce((acc, cur, i) => {
        if (i % 9 === 0) {
          acc.push([cur]);
        } else {
          acc[acc.length - 1].push(cur);
        }
        return acc;
      }, []);

      routesArrays.forEach((routesArray) => {
        busTracker.vehiclesByRoute(routesArray, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let message = {};
            console.log(data);
            if (data && data[0]) {
              message = data.map((bus) => {
                return {
                  vehicleId: bus.vid,
                  lat: bus.lat,
                  lon: bus.lon,
                  timestamp: bus.tmstmp,
                };
              });
            } else if (data) {
              message = {
                vehicleId: data.vid,
                lat: data.lat,
                lon: data.lon,
                timestamp: data.tmstmp,
              };
            }

            const success = stream.write(JSON.stringify(message));
            if (success) {
              console.log(`message queued`);
            } else {
              console.log("Too many messages in the queue already..");
            }
          }
        });
      });
    }
  });
}

setInterval(() => {
  queueCurrentLocation();
}, 10000);
