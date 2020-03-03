extern crate wasmer_runtime;
extern crate wasmer_middleware_common;
extern crate wasmer_runtime_core;
extern crate wasmer_singlepass_backend;

use std::sync::{Arc, Mutex};
use wasmer_runtime::{
  error, func, imports, instantiate, Array, Ctx, WasmPtr, Func, Value,
  compile_with
};
use wasmer_runtime_core::{
  backend::Compiler, 
  codegen::{MiddlewareChain, StreamingCompiler},
};

use wasmer_middleware_common::metering::Metering;

static WASM: &'static [u8] =
    include_bytes!("../../test-wasms/hello_world/target/wasm32-unknown-unknown/release/hello_world.wasm");
    // include_bytes!("../wasm-sample-app/target/wasm32-unknown-unknown/release/hello.wasm");

fn get_compiler(limit: u64) -> impl Compiler {
  use wasmer_singlepass_backend::ModuleCodeGenerator as SinglePassMCG;
  let c: StreamingCompiler<SinglePassMCG, _, _, _, _> = StreamingCompiler::new(move || {
    let mut chain = MiddlewareChain::new();
    chain.push(Metering::new(limit));
    chain
  });

  c
}

pub fn start() -> error::Result<()> {
  let metering_compiler = get_compiler(1000);
  let wasm_binary = WASM;
  let metering_module = compile_with(&wasm_binary, &metering_compiler).unwrap();
  let metering_import_object = imports! {
    "env" => {
      "print_str" => func!(print_str),
    },
  };

  let metering_instance = metering_module.instantiate(&metering_import_object).unwrap();
  // wasmer_middleware_common::metering::set_points_used(&mut metering_instance, 0);
  metering_instance.call("execute", &[])?;

  let x = wasmer_middleware_common::metering::get_points_used(&metering_instance);
  
  println!("gas: {}", x);
  Ok(())
}


// function list start

fn print_str(ctx: &mut Ctx, ptr: WasmPtr<u8, Array>, len: u32) {
  
  let memory = ctx.memory(0);

  // Use helper method on `WasmPtr` to read a utf8 string
  let string = ptr.get_utf8_string(memory, len).unwrap();

  // Print it!
  println!("{}", string);
}

// function list end

