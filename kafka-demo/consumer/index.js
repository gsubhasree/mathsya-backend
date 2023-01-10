const Kafka = require("node-rdkafka");

var consumer = new Kafka.KafkaConsumer(
  {
    "group.id": "kafka",
    "metadata.broker.list": "localhost:9092",
  },
  {}
);

consumer.connect();

consumer
  .on("ready", () => {
    console.log("consumer ready..");
    consumer.subscribe(["test"]);
    consumer.consume();
  })
  .on("data", function (data) {
    console.log(
      `received message: ${data.value} at time ${new Date().toISOString()}`
    );
  });
