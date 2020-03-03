# wasmer-demo

### tee-host
This is host by tee area

* Start it with "cargo run --bin grpc-server".
* That will start a grpc server with port 50001.

---

### test-wasms/hello_world
Here is a test wasm for running in TEE area and embedded by tee-host.

* Build the release wasm for tee-host.

---

### node-host
Here is a grpc client to running in untrust zone.

* Build by expressJS to receive inputs with restful requst.

---

## How to run this demo

* Build hello_world wasm first.
* Start grpc server under tee-host
* Start grpc client under node-host
* Open your browser and request http://127.0.0.1:3000/api/ping?x=2&y=4, and checkout the result from hello_world wasm.

