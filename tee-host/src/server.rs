use tonic::{transport::Server, Request, Response, Status};

use hello_world::greeter_server::{Greeter, GreeterServer};
use hello_world::{HelloReply, HelloRequest, AddNumberRequest, AddNumberResponse};

mod wasmer;

pub mod hello_world {
  tonic::include_proto!("helloworld");
}

#[derive(Default)]
pub struct MyGreeter {}

#[tonic::async_trait]
impl Greeter for MyGreeter {
    async fn say_hello(
        &self,
        request: Request<HelloRequest>,
    ) -> Result<Response<HelloReply>, Status> {
        println!("Got a request from {:?}", request.remote_addr());

        let result = wasmer::add(23, 323).unwrap();

        let reply = hello_world::HelloReply {
            message: format!("result : {}", result),
        };
        Ok(Response::new(reply))
    }

    async fn add_number(&self, request: Request<AddNumberRequest>) -> Result<Response<AddNumberResponse>, Status> {
        println!("Got a request from {:?}", request.remote_addr());

        let param = request.into_inner();
        let result = wasmer::add(param.x, param.y).unwrap();
        let reply = hello_world::AddNumberResponse {
            result: format!("{}", result),
        };

        Ok(Response::new(reply))
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "[::1]:50001".parse().unwrap();
    let greeter = MyGreeter::default();

    println!("GreeterServer listening on {}", addr);

    Server::builder()
        .add_service(GreeterServer::new(greeter))
        .serve(addr)
        .await?;

    Ok(())
}